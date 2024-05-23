import { Injectable, UploadedFile, Request } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Music } from './music.entity';
// import { UploadMusicDto } from './dto/upload-music.dto';
import { User } from '../auth/auth.entity';
import * as NodeID3 from 'node-id3';
import { MulterFile } from '../common/common.types';
import { UploadMusicDataDto } from './dto/upload-music-data.dto';
// import { deleteFileDisk, uploadFileDisk } from '../fileFunction';
// import { resolve } from 'path';
// import { readFileSync } from 'fs';
// import * as shell from 'shelljs';
// import { MusicDataDto } from './dto/music-data.dto';
// import { MusicRepository } from './music.repository';
import { Repository } from 'typeorm';
import {
  generatePermalink,
  // getAllData,
  s3,
  // uploadMusicData,
} from '../fileFunction';
import { MusicDataDto } from './dto/music-data.dto';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';
// import axios from 'axios';

@Injectable()
export class MusicService {
  constructor(
    @InjectRepository(Music)
    protected readonly musicRepository: Repository<Music>,
  ) {}

  async getAlbumNames(): Promise<any> {
    const albums = await this.musicRepository.find({
      select: { album: true, title: true },
    });
    return albums;
  }

  async getSongsByAlbum(albumName: string): Promise<any> {
    const params = {
      Bucket: 'arts',
      Prefix: `${albumName}`,
    };

    try {
      const data = await s3.listObjectsV2(params).promise();
      const songs = data.Contents.map((item) => item.Key);
      return { songs };
    } catch (error) {
      console.error(error);
      throw new Error('Failed to fetch songs from AWS S3');
    }
  }

  async findByAlbum(album: string): Promise<Music[]> {
    return this.musicRepository.find({ where: { album } });
  }

  async getAlbumsByComposer(artist: string): Promise<string[]> {
    const albums = await this.musicRepository.find({
      where: {
        artist,
      },
    });
    return albums.map((album) => album.artist);
  }

  async getMusicUrlsByAlbum(album: string): Promise<string[]> {
    const songs = await this.findByAlbum(album);
    const urls = await Promise.all(
      songs.map(async (song) => {
        const key = `music/${song.title}.mp3`; // S3 키는 실제 파일 경로에 맞게 수정해야 함
        const url = await s3.getSignedUrl('arts', key);
        return url;
      }),
    );
    return urls;
  }
  async getMusicById(id: number): Promise<Music | undefined> {
    return this.musicRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<Music[]> {
    return this.musicRepository.find();
  }

  async findAllWithPagination(limit: number, offset: number): Promise<Music[]> {
    return this.musicRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async createMusic(create_music: UploadMusicDataDto): Promise<Music> {
    const music = this.musicRepository.create(create_music);
    await this.musicRepository.save(music);
    return music;
  }

  async uploadFile(
    bucketName: string,
    fileName?: string,
    fileBuffer?: Buffer,
    metadata?: any,
  ): Promise<string> {
    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: fileBuffer,
      Metadata: metadata,
    };

    try {
      const result = await s3.upload(params).promise();
      return result.Location; // 업로드된 파일의 URL 반환
    } catch (error) {
      console.error('File upload failed:', error);
      throw new Error('File upload failed');
    }
  }

  async uploadFileAndCreateMusic(
    file: any,
    musicData: any,
    user: User,
  ): Promise<Music> {
    const { image, audio } = file;
    const imageUrl = await this.uploadFileToS3(image);
    const audioUrl = await this.uploadFileToS3(audio);
    try {
      const uuid = generatePermalink();
      const music = new Music();
      music.title = musicData.title;
      music.artist = musicData.artist;
      music.filename = musicData.files.audio[0].originalname; // mp3File이 존재하는 경우에만 originalname 사용
      music.link = musicData.link;
      music.duration = musicData.duration;
      music.permalink = uuid;
      music.status = musicData.status; // status 할당
      music.album = musicData.album; // album 할당
      music.coverFilename = musicData.files.image[0].originalname; // album 할당
      await this.save(music);
      if (!user) {
        ('로그인 해야 됩니다.');
      }
      const result = await this.musicRepository.save(music);
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  private async uploadFileToS3(file: any): Promise<string> {
    const key = `${Date.now()}_${file.originalname}`;
    const params = {
      Bucket: 'arts',
      Key: key,
      Body: file.buffer,
      ACL: 'public-read',
    };

    const data = await s3.upload(params).promise();
    return data.Location;
  }

  async getMusicByKey(
    bucketName: string,
    key: string,
  ): Promise<Music | undefined> {
    return this.musicRepository.findOne({
      where: {
        audioUrl: `https://arts.kr.object.ncloudstorage.com/${key}`,
      },
    });
  }

  async findByPermalink(permalink: string): Promise<Music | undefined> {
    return await this.musicRepository.findOne({ where: { permalink } });
  }
  async getMusicInfoFromStorage(
    permalink: string,
  ): Promise<{ permalink: string }> {
    try {
      const headParams = {
        Bucket: 'arts',
        Key: permalink,
      };

      const objectMetadata = await s3.headObject(headParams).promise();
      if (!objectMetadata.Metadata) {
        throw new Error('Metadata not found');
      }

      // 필요한 정보가 없는 경우에 대한 예외 처리
      if (
        // !objectMetadata.Metadata.title ||
        !objectMetadata.Metadata.permalink
        // !objectMetadata.Metadata.duration
      ) {
        throw new Error('Missing necessary metadata');
      }

      return {
        // title: objectMetadata.Metadata.title,
        permalink: objectMetadata.Metadata.permalink,
        // duration: objectMetadata.Metadata.duration,
      };
    } catch (error) {
      throw new Error(
        'Failed to get music info from storage: ' + error.message,
      );
    }
  }
  // async uploadMp3Files(
  //   @UploadedFile() mp3File: Express.Multer.File,
  //   user: User,
  //   music: any,
  //   // @Body() metadata: any,
  // ) {
  //   try {
  //     await this.save(music);
  //     const result = await uploadMusicData(mp3File, user, music);
  //     return { result };
  //   } catch (error) {
  //     console.error('[FILE FUNCTION UPLOAD MUSIC DATA]' + error);
  //   }
  // }
  async getAllMusic(): Promise<Music[]> {
    try {
      const allMusic = await this.musicRepository.find();
      return allMusic;
    } catch (error) {
      throw new Error('Failed to get all music: ' + error.message);
    }
  }
  changeMusicFileData(
    file: MulterFile,
    data: UploadMusicDataDto,
    image?: MulterFile,
  ) {
    const { description, lyrics } = data;

    let tags: any = {
      title: data.title,
      genre: data.genre,
      artist: data.artist,
      album: data.album,
      performerInfo: data.albumartist,
      composer: data.composer,
      year: data.year,
    };

    if (image) {
      tags = {
        ...tags,
        image: {
          type: { id: 3, name: 'front cover' },
          mime: image.mimetype,
          description: 'album cover',
          imageBuffer: image.buffer,
        },
      };
    }

    if (lyrics) {
      tags = {
        ...tags,
        unsynchronisedLyrics: {
          language: 'kor',
          text: lyrics,
        },
      };
    }

    if (description) {
      tags = {
        ...tags,
        comment: {
          language: 'kor',
          text: description,
        },
      };
    }

    const newBuffer = NodeID3.update(tags, file.buffer);
    return !newBuffer ? file : { ...file, buffer: newBuffer };
  }
  async save(body) {
    return this.musicRepository.save(body);
  }
  // async getAllMusic(): Promise<Music[]> {
  //   return this.musicRepository.find();
  // }
  // async getMusicByUUID(uuid: string): Promise<Music> {
  //   const music = await this.musicRepository.findOne({ where: { uuid } });
  //   if (!music) {
  //     throw new NotFoundException('Music not found');
  //   }
  //   return music;
  // }

  async getMetadataWithPermalink(bucketName: string): Promise<any[]> {
    const params = {
      Bucket: bucketName,
    };

    const data = await s3.listObjects(params).promise();

    const musicRecords = [];

    // 객체 메타데이터 확인 및 처리
    for (const obj of data.Contents) {
      const getObjectParams = {
        Bucket: bucketName,
        Key: obj.Key,
      };

      // S3 객체 메타데이터 가져오기
      const objectMetadata = await s3.headObject(getObjectParams).promise();

      // Permalink 확인
      const permalink = objectMetadata.Metadata?.permalink;

      if (permalink) {
        musicRecords.push({
          permalink,
          metadata: objectMetadata,
        });
      }
    }

    return musicRecords;
  }

  async getObject(bucket: string, key: string): Promise<Buffer> {
    const params = {
      Bucket: bucket,
      Key: key,
    };
    const data = await s3.getObject(params).promise();

    // const data = await this.s3.getObject(params).promise();
    return data.Body as Buffer; // Body가 Buffer 타입임을 명시
  }

  async listObjects(bucketName: string): Promise<any> {
    const listObjectsParams = {
      Bucket: bucketName,
    };
    return s3.listObjects(listObjectsParams).promise();
  }

  async getMusicTitleByFilename(): Promise<Music[]> {
    return await this.musicRepository.find();
  }
}

import {
  Injectable,
  UploadedFile,
} from '@nestjs/common';

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
import { getAllData, s3, uploadMusicData } from '../fileFunction';
import { MusicDataDto } from './dto/music-data.dto';
import { v4 as uuidv4 } from 'uuid';
// import axios from 'axios';

@Injectable()
export class MusicService {
  constructor(
    @InjectRepository(Music)
    protected readonly musicRepository: Repository<Music>,
  ) {}
  async findById(id: number): Promise<Music> {
    return this.musicRepository.findOne({ where: { id } });
  }
  async getMusicFromNaverStorage(): Promise<any> {
    try {
      // 네이버 스토리지에서 모든 데이터 가져오기
      const allNaverStorageData = await getAllData();
      // Music 테이블에서 모든 데이터 가져오기
      const allMusic = await this.getAllMusic();
      // 네이버 스토리지 데이터와 Music 테이블 데이터를 비교하여 일치하는 데이터 추출
      const matching_data = allNaverStorageData.filter((naverData) => {
        return allMusic.map((music) => music.permalink).includes(naverData);
      });
      console.log('matchingData', matching_data);

      const result = [];

      for (const music_data of matching_data) {
        const music = await this.musicRepository.findOne({
          where: {
            permalink: music_data,
          },
        });
        // if (music) {
        //   const metadata = await this.getMusicInfoFromStorage(music_data);
        //   music.permalink = metadata.permalink;
        // }
        result.push(music);
      }
      console.log('[RESULT]' + result);
      return result;
      // matchingData 배열의 각 요소를 매개변수로 전달하여 getMusicByPermalink 호출하고, 결과를 반환합니다.
      // const result = await Promise.all(
      //   matchingData.map(async (naverData) => {
      //     const music = await this.getMusicByPermalink(naverData);
      //     return music;
      //   }),
      // );
      // return result;
    } catch (error) {
      throw new Error(
        'Failed to get music from Naver Storage: ' + error.message,
      );
    }
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
  async uploadMp3Files(
    @UploadedFile() mp3File: Express.Multer.File,
    user: User,
    music: any,
    // @Body() metadata: any,
  ) {
    try {
      const result = await uploadMusicData(mp3File, user, music);
      return { result };
    } catch (error) {
      console.error('[FILE FUNCTION UPLOAD MUSIC DATA]' + error);
    }
  }
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
  async getObject(
    bucketName: string,
    key: string,
  ): Promise<AWS.S3.GetObjectOutput> {
    const getObjectParams: AWS.S3.GetObjectRequest = {
      Bucket: bucketName,
      Key: key,
    };
    return s3.getObject(getObjectParams).promise();
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

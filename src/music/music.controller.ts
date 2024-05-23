import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
  Request,
  UploadedFiles,
  UnauthorizedException,
  NotFoundException,
  Logger,
  Query,
  // Post,
  // UploadedFile,
  // UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MusicService } from './music.service';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { Music } from './music.entity';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
// import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth/auth.service';
import {
  generatePermalink,
  getBucketMusic,
  // generatePermalink,
  // getBucketMusic,
  // getObjectStream,
  s3,
  uploadImageFile,
} from '../fileFunction';
// import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';
import * as stream from 'stream';
import { UploadMusicDataDto } from './dto/upload-music-data.dto';
import { Readable } from 'stream';
const pipeline = util.promisify(stream.pipeline);

@ApiTags('MUSIC CONTROLLER')
@Controller('music')
export class MusicController {
  private readonly logger = new Logger(MusicController.name);

  constructor(
    private musicService: MusicService,
    private authService: AuthService,
  ) {}

  @Get('/audio/:bucketName/:key')
  async getAudio(
    @Param('bucketName') bucketName: string,
    @Param('key') key: string,
    @Res() res: Response,
  ) {
    try {
      const music = await this.musicService.getMusicByKey(bucketName, key);
      if (!music) {
        return res.status(404).json({ message: 'Music not found' });
      }

      const params = {
        Bucket: bucketName,
        Key: key,
      };
      const response = await s3.getObject(params).promise();

      res.set('Content-Type', 'audio/mpeg');
      res.send({
        audioBuffer: response.Body,
        imageUrl: music.imageUrl,
      });
    } catch (error) {
      console.error('Error streaming audio:', error);
      res.status(500).send('Server error');
    }
  }

  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'audio', maxCount: 1 },
      { name: 'image', maxCount: 1 },
    ]),
  )
  async uploadMusic(
    @Body() music: UploadMusicDataDto,
    @UploadedFiles()
    files: { audio?: Express.Multer.File[]; image?: Express.Multer.File[] },
  ) {
    try {
      const audioFile = files.audio?.[0];

      if (!audioFile) {
        throw new Error('Audio file is missing');
      }

      const uuid = uuidv4();

      const metadata = {
        'x-amz-meta-permalink': uuid,
      };

      const audioUrl = await this.musicService.uploadFile(
        'arts',
        `${audioFile.originalname}`,
        audioFile.buffer,
        metadata,
      );

      let imageUrl: string | null = null;
      if (files.image?.[0]) {
        const imageFile = files.image[0];
        imageUrl = await this.musicService.uploadFile(
          'album-cover',
          `${imageFile.originalname}`,
          imageFile.buffer,
          metadata,
        );

        if (!imageUrl) {
          throw new Error('Image file upload failed');
        }
      }

      const musicData = {
        title: music.title,
        artist: music.artist,
        album: music.album,
        permalink: uuid,
        duration: music.duration,
        status: music.status,
        filename: audioFile.originalname,
        coverFilename: files.image?.[0]?.originalname ?? null,
        link: '링크',
        audioUrl: audioUrl,
        imageUrl: imageUrl || '',
      };

      return await this.musicService.createMusic(musicData);
    } catch (error) {
      throw new Error(`Music upload failed: ${error.message}`);
    }
  }

  @Get('/mp3/:filename')
  async getMp3(@Param('filename') filename: string, @Res() res: Response) {
    const bucketName = 'arts';
    const key = filename;
    try {
      const fileBuffer = await this.musicService.getObject(bucketName, key);
      const fileStream = new Readable();
      fileStream.push(fileBuffer);
      fileStream.push(null); // 스트림의 끝을 표시

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', `inline; filename=${filename}`);
      fileStream.pipe(res);
    } catch (error) {
      this.logger.error(
        `Failed to fetch MP3 file: ${error.message}`,
        error.stack,
      );
      res.status(500).send('Error fetching the MP3 file');
    }
  }

  @Get(':id')
  async getMusic(@Param('id') id: number): Promise<any> {
    const music = await this.musicService.getMusicById(id);
    if (!music) {
      throw new NotFoundException('Music not found');
    }
    return {
      id: music.id,
      title: music.title,
      artist: music.artist,
      album: music.album,
      permalink: music.permalink,
      duration: music.duration,
      status: music.status,
      filename: music.filename,
      link: music.link,
      audioUrl: music.audioUrl,
      imageUrl: music.imageUrl,
    };
  }

  // @Get(':permalink')
  // async findByPermalink(@Param('permalink') permalink: string) {
  //   return this.musicService.findByPermalink(permalink);
  // }
  @Get('/get/table')
  async findAllWithPagination(
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
  ): Promise<Music[]> {
    return this.musicService.findAllWithPagination(limit, offset);
  }

  @Get('allBucket')
  async getAllMusicFiles(): Promise<any> {
    try {
      const mp3Files = await getBucketMusic();
      return { mp3Files };
    } catch (error) {
      console.error('Error fetching music files:', error);
      throw new Error('Failed to fetch music files');
    }
  }

  @Get('/list-objects/:bucketName')
  async listObjects(@Param('bucketName') bucketName: string) {
    return this.musicService.listObjects(bucketName);
  }

  // @Get('db')
  // async getMusicDb() {
  //   try {
  //     const result = await this.musicService.getMusicFromNaverStorage();
  //     return { result };
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }
  @Get('/image/:bucketName')
  async checkMusicRecordsByPermalink(@Param('bucketName') bucketName: string) {
    const musicRecords =
      await this.musicService.getMetadataWithPermalink(bucketName);
    return { message: 'Check complete', musicRecords };
  }

  @Get('/find/albums')
  async getAlbumNames(): Promise<string[]> {
    return await this.musicService.getAlbumNames();
  }

  @Get('albums/:albumName/songs')
  async getSongsByAlbum(@Param('albumName') albumName: string): Promise<any> {
    return this.musicService.getSongsByAlbum(albumName);
  }

  @Get('/image/:bucketName/:key')
  async getImageWithMetadata(
    @Param('bucketName') bucketName: string,
    @Param('key') key: string,
    @Res() res: Response,
  ) {
    try {
      const params = {
        Bucket: 'arts', // 네이버 스토리지 버킷 이름
        Key: key, // 이미지 파일 경로 및 이름
      };

      const imageStream = s3.getObject(params).createReadStream();
      const imageObject = await s3.headObject(params).promise();

      // 이미지 파일의 메타데이터를 클라이언트로 전송
      res.setHeader('Content-Type', imageObject.ContentType); // 이미지 파일의 Content-Type 설정
      res.setHeader('Content-Length', imageObject.ContentLength.toString()); // 이미지 파일의 크기 설정
      res.setHeader('Last-Modified', imageObject.LastModified.toString()); // 이미지 파일의 최종 수정일 설정

      imageStream.pipe(res); // 이미지 스트림을 클라이언트로 전송
    } catch (error) {
      console.error('Error getting image:', error);
      res.status(500).send('Failed to get image');
    }
  }

  // @Get('/audio/:bucketName/:key')
  // async getAudio(
  //   @Param('bucketName') bucketName: string,
  //   @Param('key') key: string,
  //   @Res() res: Response,
  // ) {
  //   try {
  //     const params = {
  //       Bucket: bucketName, // 네이버 스토리지 버킷 이름
  //       Key: key, // 파일 경로 및 이름
  //     };
  //     const response = await s3.getObject(params).promise();
  //     const audioBuffer = response.Body as Buffer;
  //
  //     res.set('Content-Type', 'audio/mpeg');
  //     res.send(audioBuffer);
  //     // 적절한 컨텐츠 타입을 설정합니다.
  //     // res.setHeader('Content-Type', 'audio/mpeg'); // 예시로 'audio/mpeg'를 설정하고, 실제로 해당 컨텐츠 타입을 적절히 설정해야 합니다.
  //   } catch (error) {
  //     console.error('Error streaming audio:', error);
  //     res.status;
  //   }
  // }
  // @Get('music_title/:permalink')
  // async getMusicTitle(
  //   @Param('permalink') permalink: string,
  //   @Res() res: Response,
  // ): Promise<any> {
  //   try {
  //     const musicInfo =
  //       await this.musicService.getMusicInfoByPermalink(permalink);
  //     if (!musicInfo) {
  //       res.status(404).send('Music not found');
  //       return;
  //     }
  //     return { musicInfo };
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }
  // @Get('get/:filename')
  // async getMusicFile(
  //   @Param('filename') filename: string,
  //   @Res() res: Response,
  // ) {
  //   try {
  //     // 네이버 스토리지에 있는 음악 파일을 가져오는 로직을 구현합니다.
  //     const musicFilePath = await getMusicFilePathFromNaverStorage(filename); // 네이버 스토리지에서 음악 파일 경로를 가져옵니다.
  //
  //     // 가져온 음악 파일을 클라이언트에게 응답으로 전송합니다.
  //     res.sendFile(musicFilePath);
  //   } catch (error) {
  //     console.error('Error getting music file:', error);
  //     res.status(500).send('Failed to get music file');
  //   }
  // }
  @Get('stream/all')
  async getAllMusicStreaming(@Res() res: Response) {
    try {
      const params = {
        Bucket: 'arts', // 네이버 스토리지 버킷 이름
      };
      const data = await s3.listObjects(params).promise();
      const mp3Files = data.Contents.filter((obj) => obj.Key.endsWith('.mp3'));

      // 모든 MP3 파일을 응답으로 전송
      for (const file of mp3Files) {
        const params = {
          Bucket: 'arts',
          Key: file.Key,
        };
        // const response = await s3.getObject(params).promise();
        // const audioBuffer = response.Body as Buffer;
        // res.set('Content-Type', 'audio/mpeg');
        // res.send(audioBuffer);
        const audio_stream = await s3.getObject(params).createReadStream();
        res.set('Content-Type', 'audio/mpeg');
        await pipeline(audio_stream, res);
      }

      res.end(); // 응답 종료
    } catch (error) {
      console.error('Error getting music files:', error);
      res.status(500).send('Failed to get music files');
    }
  }

  @Get('st/:filename')
  async getMusicFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    try {
      const params = {
        Bucket: 'arts', // 네이버 스토리지 버킷 이름
        Key: filename, // 파일 경로 및 이름
      };
      const response = await s3.getObject(params).promise();
      const audioBuffer = response.Body as Buffer;

      res.set('Content-Type', 'audio/mpeg');
      res.send(audioBuffer);
    } catch (error) {
      console.error('Error getting music file:', error);
      res.status(500).send('Failed to get music file');
    }
  }

  // 다운로드
  // @Get(':filename')
  // async downMusicFile(
  //   @Param('filename') filename: string,
  //   @Req() req: Request,
  //   @Res() res: Response,
  // ) {
  //   try {
  //     // 네이버 스토리지에서 MP3 파일을 가져오기 위한 URL 생성
  //     const musicFilePath = `https://kr.object.ncloudstorage.com/arts/${filename}`;
  //     const stat = fs.statSync(musicFilePath);
  //     const range = req.headers['range']; // 타입 캐스팅으로 range 속성 접근
  //     const fileSize = stat.size;
  //     const audioType = 'audio/mpeg'; // MP3 파일인 경우
  //
  //     if (range) {
  //       const parts = range.replace(/bytes=/, '').split('-');
  //       const start = parseInt(parts[0], 10);
  //       const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
  //       const chunksize = end - start + 1;
  //       const file = fs.createReadStream(musicFilePath, { start, end });
  //       const head = {
  //         'Content-Range': `bytes ${start}-${end}/${fileSize}`,
  //         'Accept-Ranges': 'bytes',
  //         'Content-Length': chunksize,
  //         'Content-Type': audioType,
  //       };
  //
  //       res.writeHead(206, head);
  //       file.pipe(res);
  //     } else {
  //       const head = {
  //         'Content-Length': fileSize,
  //         'Content-Type': audioType,
  //       };
  //       res.writeHead(200, head);
  //       fs.createReadStream(musicFilePath).pipe(res);
  //     }
  //   } catch (error) {
  //     console.error('Error getting music file:', error);
  //     res.status(500).send('Failed to get music file');
  //   }
  // }

  // @Get(':uuid')
  // async getMusicByUUID(@Param('uuid') uuid: string): Promise<Music> {
  //   return this.musicService.getMusicByUUID(uuid);
  // }
}

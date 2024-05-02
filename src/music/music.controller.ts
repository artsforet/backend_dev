import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
  Request,
  // Post,
  // UploadedFile,
  // UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MusicService } from './music.service';
import { FileInterceptor } from '@nestjs/platform-express';
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
const pipeline = util.promisify(stream.pipeline);

@ApiTags('MUSIC CONTROLLER')
@Controller('music')
export class MusicController {
  constructor(
    private musicService: MusicService,
    private authService: AuthService,
  ) {}

  // @ApiOperation({
  //   summary: '네이버 스토리지 버켓 조회',
  //   description: '버켓을 조회한다',
  // })
  // @ApiQuery({ required: false, name: 'option' })
  // @ApiResponse({
  //   status: 200,
  //   description:
  //     'Music[] 또는 { genre: "string", musics: Music[] }[]의 데이터를 반환받는다.',
  // })
  // @Get('/bucketmusic')
  // async BucketObject() {
  //   try {
  //     const buckets = await getBucketMusic();
  //     return { success: true, buckets };
  //   } catch (error) {
  //     return { success: false, error: 'Failed to fetch bucket list' };
  //   }
  // }

  @Get('db')
  async getMusicFromNaverStoragelist() {
    try {
      const musicData = await this.musicService.getMusicFromNaverStorage();
      console.log('MUSIC_DATA', musicData);
      return musicData;
    } catch (error) {
      // 에러 핸들링
      console.error(error);
      return { error: 'Failed to fetch music data' };
    }
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('mp3_file'), FileInterceptor('image_file'))
  async uploadFiles(
    @Request() req,
    @UploadedFile() mp3File: Express.Multer.File,
    @UploadedFile() imageFile: Express.Multer.File,
    @Body('title') title: any,
    @Body('filename') filename: string,
    @Body('permalink') permalink: string,
    @Body('link') link: string,
    @Body('duration') duration: number,
    @Body('status') status: string, // status 파라미터 추가
    @Body('album') album: string, // album 파라미터 추가
    @Body('coverFilename') coverFilename: string, // album 파라미터 추가
  ) {
    try {
      const uuid = generatePermalink();
      const music = new Music();
      music.title = title;
      music.filename = mp3File.originalname; // mp3File이 존재하는 경우에만 originalname 사용
      music.link = link;
      music.duration = duration;
      music.permalink = uuid;
      music.status = status; // status 할당
      music.album = album; // album 할당
      music.coverFilename = coverFilename; // album 할당
      await this.musicService.save(music);

      const user = req.user;

      if (!user) {
        console.log('로그인 해야 음악을 업로드할 수 있습니다.');
      }
      const mp3UploadUrl = await this.musicService.uploadMp3Files(
        mp3File,
        user,
        music,
      );
      const imageUploadResult = await uploadImageFile(imageFile, user, music);

      return { mp3UploadUrl, imageUploadResult };
    } catch (errorMessage) {
      console.log(errorMessage);
    }
  }

  @Get(':permalink')
  async findByPermalink(@Param('permalink') permalink: string) {
    return this.musicService.findByPermalink(permalink);
  }
  @Get('getAll')
  async getAllMusic(): Promise<Music[]> {
    return this.musicService.getAllMusic();
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

  @Get('/audio/:bucketName/:key')
  async getAudio(
    @Param('bucketName') bucketName: string,
    @Param('key') key: string,
    @Res() res: Response,
  ) {
    try {
      const params = {
        Bucket: bucketName, // 네이버 스토리지 버킷 이름
        Key: key, // 파일 경로 및 이름
      };
      const response = await s3.getObject(params).promise();
      console.log(response);
      const audioBuffer = response.Body as Buffer;

      res.set('Content-Type', 'audio/mpeg');
      res.send(audioBuffer);
      // 적절한 컨텐츠 타입을 설정합니다.
      // res.setHeader('Content-Type', 'audio/mpeg'); // 예시로 'audio/mpeg'를 설정하고, 실제로 해당 컨텐츠 타입을 적절히 설정해야 합니다.
    } catch (error) {
      console.error('Error streaming audio:', error);
      res.status;
    }
  }
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

// import fetch from 'node-fetch';
// import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
// import { MulterFile } from './common/common.types';
// import { join, resolve } from 'path';
// // import { getStorage } from 'firebase-admin/storage';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4, v4 as uuid } from 'uuid';

import { Music } from './music/music.entity';
import * as path from 'path';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import { Readable } from 'stream';
import { User } from './auth/auth.entity';

// import { createReadStream } from 'fs';
// import { InternalServerErrorException } from '@nestjs/common';
// import * as fs from 'fs';

const endPoint = 'https://kr.object.ncloudstorage.com';
const credentials = new AWS.Credentials({
  accessKeyId: 'ksyMymlggWrKgL2RsYaj',
  secretAccessKey: 'NZ3tJD8yPki0ulgtbIy2MByekKNErlr6y7AZbtpV',
});

export const s3 = new AWS.S3({
  endpoint: endPoint,
  credentials: credentials,
});

// const client = new S3Client({});

// export async function uploadMusicData(
//   // buffer: Buffer,
//   // contentType: string,
//   file: Express.Multer.File,
//   // filename: string,
//   // metadata: any,
//   user: any,
//   music: any,
// ) {
//   const bucket_name = 'arts';
//   const params = {
//     Bucket: bucket_name,
//     Key: String(file.originalname),
//     Body: file.buffer,
//     Metadata: {
//       permalink: music.permalink, // 고유한 아이디를 메타데이터에 추가
//     },
//   };
//   try {
//     // const downloadToken = uuidv4();
//     // const params: await s3.PutObjectRequest = {
//     //   Bucket: 'arts',
//     //   Key: filename,
//     //   Body: buffer,
//     //   ContentType: contentType,
//     // };
//
//     const result = await s3.upload(params).promise();
//     const filename = file.originalname;
//     const permalink = music.permalink;
//
//     // const bucket = 'arts';
//
//     return { result, filename, permalink };
//   } catch (e) {
//     throw new Error('Failed to upload file.');
//   }
// }

export async function uploadImageFile(
  file: Express.Multer.File,
  music: any,
  user: any,
) {
  const bucketName = 'album-image-bucket';
  try {
    const params = {
      Bucket: bucketName,
      Key: `${music.coverFilename}_image`, // 이미지 파일 경로 (mp3 파일명_image)
      Body: file.buffer,
      // Metadata: {
      //   permalink: music.permalink, // 고유한 아이디를 메타데이터에 추가
      // },
    };
    const uploadResult = await s3.upload(params).promise();
    return { uploadUrl: uploadResult.Location };
  } catch (error) {
    throw new Error('Failed to upload image file.');
  }
}

export async function edit_file_name() {
  const command = new this.s3.CopyObjectCommand({
    CopySource: 'SOURCE_BUCKET/SOURCE_OBJECT_KEY',
    Bucket: 'DESTINATION_BUCKET',
    Key: 'NEW_OBJECT_KEY',
  });
}

//
// export async function getBucketMusic() {
//   try {
//     // const get_data = await s3.listBuckets().promise();
//     // const bucket_name = get_data.Buckets[0].Name;
//     const data = await s3.listObjects({ Bucket: 'arts' }).promise();
//     return { data };
//   } catch (error) {
//     console.error('Error listing objects:', error);
//   }
// }
//
// const options = {
//   partSize: 5 * 1024 * 1024,
// };
//
// export async function uploadImageData(image_file: Express.Multer.File) {
//   const AWS_S3_BUCKET = 'arts';
//   const params = {
//     Bucket: AWS_S3_BUCKET,
//     Key: String(image_file.originalname),
//     Body: image_file.buffer,
//   };
//   try {
//     const response = await s3.upload(params).promise();
//     return { response };
//   } catch (error) {
//     console.error(error);
//   }
// }
export async function getBucketMusic(): Promise<string[]> {
  try {
    const data = await s3.listObjects({ Bucket: 'arts' }).promise();
    const mp3Files = data.Contents.filter((obj) =>
      obj.Key.endsWith('.mp3'),
    ).map((obj) => obj.Key);
    return mp3Files;
  } catch (error) {
    console.error('Error listing objects:', error);
    throw new Error('Failed to list MP3 files from the bucket');
  }
}

export async function getMusicFiles(): Promise<string[]> {
  try {
    const data = await this.s3
      .listObjects({ Bucket: 'YOUR_BUCKET_NAME' })
      .promise(); // 여기에 버킷 이름을 넣으세요
    const mp3Files = data.Contents.filter((obj) =>
      obj.Key.endsWith('.mp3'),
    ).map((obj) => obj.Key);
    return mp3Files;
  } catch (error) {
    console.error('Error listing objects:', error);
    throw new Error('Failed to list MP3 files from the bucket');
  }
}

export function generatePermalink(): string {
  return uuidv4(); // UUID 생성
  // 또는 고유한 값 생성 로직을 여기에 추가
}

// export async function getAllData(): Promise<any[]> {
//   try {
//     const params = {
//       Bucket: 'arts',
//     };
//
//     const data = await s3.listObjectsV2(params).promise();
//     if (!data.Contents) {
//       throw new Error('No data found in Naver Storage');
//     }
//
//     // 객체 목록에서 각 객체의 메타데이터를 가져와서 permalink만 추출하여 배열로 반환
//     const permalinksPromises = data.Contents.map(async (obj) => {
//       const objectParams = {
//         Bucket: params.Bucket,
//         Key: obj.Key,
//       };
//       try {
//         const metadata = await s3.headObject(objectParams).promise();
//         return metadata.Metadata ? metadata.Metadata.permalink : null;
//       } catch (error) {
//         throw new BadRequestException({}, `메타 데이터 조회 실패`);
//       }
//     });
//
//     // 모든 객체의 메타데이터를 가져올 때까지 기다림
//     const permalinks = await Promise.all(permalinksPromises);
//     console.log(permalinks);
//     // 메타데이터가 있는 항목만 필터링
//     const filteredPermalinks = permalinks.filter(
//       (permalink) => permalink !== null,
//     );
//     return filteredPermalinks;
//   } catch (error) {
//     throw new Error('Failed to get data from Naver Storage: ' + error.message);
//   }
// }

// export async function getAudioDatas(permalink: string): Promise<Readable> {
//   try {
//     const metadata = await this.s3.headObject({ Bucket: 'arts', Key: permalink }).promise();
//     const filename = metadata.Metadata.filename;
//     const data = await this.s3.getObject({ Bucket: 'arts', Key: filename }).promise();
//     return data.Body;
//   } catch (error) {
//     throw new Error('Failed to fetch audio data: ' + error.message);
//   }
// }
export async function getMusicFile(filename: string): Promise<Buffer> {
  const params = {
    Bucket: 'arts',
    Key: filename,
  };
  try {
    const data = await this.s3.getObject(params).promise();
    return data.Body as Buffer;
  } catch (error) {
    throw new Error(
      `Failed to fetch music file from Naver Storage: ${error.message}`,
    );
  }
}

// export async function getObjectStream(
//   bucketName: string,
//   key: string,
// ): Promise<NodeJS.ReadableStream> {
//   try {
//     // getObject 메서드의 반환 값으로 스트림을 얻어옵니다.
//     const object = await s3
//       .getObject({ Bucket: bucketName, Key: key })
//       .promise();
//     return object.Body as NodeJS.ReadableStream;
//   } catch (error) {
//     console.error('Error getting object stream from S3:', error);
//     throw error;
//   }
// }

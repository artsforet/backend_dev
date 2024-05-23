// import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule);
  // const configService = app.get(ConfigService);
  // const port = configService.get<string>('SERVER_PORT');
  app.setGlobalPrefix('api');
  // app.enableCors({
  //   origin: true,
  //   credentials: true,
  // });
  // Swagger API 문서화
  const config = new DocumentBuilder()
    .addBearerAuth()
    // .addCookieAuth('waverefresh')
    .setTitle('예술숲 API')
    .setDescription('예술숲에 사용되는는 API 문서입니다.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // AWS 자격 증명 설정
  // AWS.config.update({
  //   accessKeyId: process.env.NAVER_CLOUD_ACCESS_KEY_ID,
  //   secretAccessKey: process.env.NAVER_CLOUD_SECRET_ACCESS_KEY,
  //   // region: ncloudRegion,
  // });
  const port = 8000;
  app.use(cookieParser());
  const corsOptions: CorsOptions = {
    origin: 'http://localhost:8081', // 프론트엔드의 도메인
    credentials: true,
  };
  app.enableCors(corsOptions);

  app.listen(port, () => {
    // app.listen(process.env.PORT || port || 8000, () => {
    logger.log(`Application running on port ${port}`);
  });
}
bootstrap();

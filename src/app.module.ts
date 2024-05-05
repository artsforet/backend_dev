import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ResetModule } from './reset/reset.module';
import { MusicModule } from './music/music.module';
import { MusicRepository } from './music/music.repository';
import { PlaylistRepository } from './playlist/playlist.repository';
import { PlaylistModule } from './playlist/playlist.module';
import { CommentModule } from './comment/comment.module';
import { HistoryModule } from './history/history.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'ArtsForest1234',
      database: 'streaming',
      autoLoadEntities: true,
      // logging: true, // 디버그 로그 활성화
    }),
    TypeOrmModule.forFeature([MusicRepository, PlaylistRepository]),
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..'),
    // }),
    MusicModule,
    AuthModule,
    PlaylistModule,
    CommentModule,
    HistoryModule,
    ResetModule,
  ],
})
export class AppModule {}

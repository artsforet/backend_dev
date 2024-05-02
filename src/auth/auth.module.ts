import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { Token } from './token.entity';
import { TokenService } from './token.service';
// import { MusicRepository } from '../music/music.repository';
// import { PlaylistRepository } from '../playlist/playlist.service';
// import { Music } from "../music/music.entity";
// import { MusicController } from "../music/music.controller";
// import { MusicService } from "../music/music.service";
// import { User } from './auth.entity';
// import { Music } from '../music/music.entity';
// import { Playlist } from '../playlist/playlist.entity';
// import { History } from '../history/history.entity';
import { CommentRepository } from '../comment/comment.repository';
// import { Comment } from '../comment/comment.entity';
import { MusicRepository } from '../music/music.repository';
import { PlaylistRepository } from '../playlist/playlist.repository';
import { HistoryRepository } from '../history/history.repository';
import { User } from './auth.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Token,
      User,
      MusicRepository,
      PlaylistRepository,
      HistoryRepository,
      CommentRepository,
    ]),
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '1w' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService],
  exports: [AuthService],
})
export class AuthModule {}

// imports: [TypeOrmModule.forFeature([Music]), AuthModule],
//   controllers: [MusicController],
//   providers: [MusicService, MusicRepository],

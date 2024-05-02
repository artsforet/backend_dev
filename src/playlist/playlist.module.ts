import { MusicRepository } from './../music/music.repository';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
// import { UserRepository } from 'src/auth/user.repository';
import { PlaylistRepository } from './playlist.repository';
import { PlaylistService } from './playlist.service';
import { PlaylistController } from './playlist.controller';
import { Playlist } from './playlist.entity';
import { User } from '../auth/auth.entity';
import { Music } from '../music/music.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Playlist, User, Music]), AuthModule],
  controllers: [PlaylistController],
  providers: [
    PlaylistService,
    PlaylistRepository,
    MusicRepository,
    // UserRepository,
  ],
  exports: [PlaylistService],
})
export class PlaylistModule {}

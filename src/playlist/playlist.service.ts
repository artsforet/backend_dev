import { Playlist } from './playlist.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// import { Music } from '../music/music.entity';
// import { MusicRepository } from "../music/music.repository";
import { PlaylistRepository } from './playlist.repository';
@Injectable()
export class PlaylistService {
  constructor(
    @InjectRepository(Playlist)
    protected readonly playlistRepository: PlaylistRepository,
  ) {}
  // getDetailPlaylistQuery() {
  //   return this.createQueryBuilder('playlist')
  //     .leftJoinAndSelect('playlist.user', 'user')
  //     .leftJoinAndSelect('playlist.musics', 'musics')
  //     .leftJoinAndSelect('musics.user', 'pmu')
  //     .leftJoinAndSelect('playlist.likes', 'likes')
  //     .leftJoinAndSelect('playlist.reposts', 'reposts')
  //     .loadRelationCountAndMap('playlist.musicsCount', 'playlist.musics')
  //     .loadRelationCountAndMap('playlist.likesCount', 'playlist.likes')
  //     .loadRelationCountAndMap('playlist.repostsCount', 'playlist.reposts')
  //     .loadRelationCountAndMap('musics.count', 'musics.history');
  // }
}

import { Playlist } from './playlist.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// import { Music } from '../music/music.entity';
// import { MusicRepository } from "../music/music.repository";
import { PlaylistRepository } from './playlist.repository';
import { Music } from '../music/music.entity';
import { MusicRepository } from '../music/music.repository';
import { User } from '../auth/auth.entity';
@Injectable()
export class PlaylistService {
  constructor(
    @InjectRepository(Playlist)
    protected playlistRepository: PlaylistRepository,
    @InjectRepository(Music)
    protected musicRepository: MusicRepository,
    @InjectRepository(User)
    protected userRepository: any,
  ) {}
  async addMusicToPlaylist(
    userId: number,
    playlistId: number,
    musicId: number,
  ): Promise<Playlist> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const playlist = await this.playlistRepository.findOne({
      where: { id: playlistId },
      relations: ['musics'],
    });
    const music = await this.musicRepository.findOne({
      where: { id: musicId },
    });

    if (!user || !playlist || !music) {
      throw new Error('User, Playlist, or Music not found');
    }

    playlist.musics.push(music);
    return this.playlistRepository.save(playlist);
  }
  // getDetailPlaylistQuery() {
  //   return (
  //     this.playlistRepository
  //       .createQueryBuilder('playlist')
  //       .leftJoinAndSelect('playlist.user', 'user')
  //       .leftJoinAndSelect('playlist.musics', 'musics')
  //       .leftJoinAndSelect('musics.user', 'pmu')
  //       .leftJoinAndSelect('playlist.likes', 'likes')
  //       .leftJoinAndSelect('playlist.reposts', 'reposts')
  //   .loadRelationCountAndMap('playlist.musicsCount', 'playlist.musics')
  //   .loadRelationCountAndMap('playlist.likesCount', 'playlist.likes')
  //   .loadRelationCountAndMap('playlist.repostsCount', 'playlist.reposts')
  //   .loadRelationCountAndMap('musics.count', 'musics.history');
  // }

  // async list() {
  //   this.getDetailPlaylistQuery();
  //   return;
  // }

  async addSongToPlaylist(
    userId: any,
    name: string,
    songId: any,
    isPlaying: any,
  ): Promise<Playlist> {
    const playlist = new Playlist();
    playlist.id = userId;
    playlist.name = name;
    playlist.songId = songId;
    playlist.isPlaying = isPlaying;
    return this.playlistRepository.save(playlist);
  }
}
// async updatePlaylist( songId: number, isPlaying: boolean): Promise<void> {
//   await this.playlistRepository
//     .createQueryBuilder()
//     .update(Playlist)
//     .set({ isPlaying })
//     .where('userId = :userId AND songId = :songId', { songId })
//     .execute();
// }

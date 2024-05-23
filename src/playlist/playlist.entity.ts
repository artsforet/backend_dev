// src/playlist/playlist.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../auth/auth.entity';
import { Music } from '../music/music.entity';

@Entity()
export class Playlist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  songId: number;

  @Column()
  isPlaying: boolean;

  @ManyToOne(() => User, (user) => user.playlists, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToMany(() => Music, (music) => music.playlists, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinTable()
  musics: Music[];
}

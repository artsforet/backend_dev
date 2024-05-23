import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
// import { Comment } from '../comment/comment.entity';
// import { Playlist } from '../playlist/playlist.entity';

export const ㅂ = [
  'Hip-hop & Rap',
  'Pop',
  'R&B & Soul',
  'Electronic',
  'House',
  'Soundtrack',
  'Dance & EDM',
  'Jazz & Blues',
  'Folk & Singer-Songwriter',
  'Rock',
  'Indie',
  'Classical',
  'Piano',
  'Ambient',
  'Techno',
  'Trap',
  'Dubstep',
  'Country',
  'Metal',
  'Trance',
  'Latin',
  'Drum & Base',
  'Reggae',
  'Disco',
  'World',
];

// src/music/music.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { User } from '../auth/auth.entity';
import { Playlist } from '../playlist/playlist.entity';

@Entity()
export class Music {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  permalink: string;

  @Column()
  filename: string;

  @Column()
  link: string;

  @Column('float')
  duration: number;

  @Column({ nullable: true })
  cover: string;

  @Column({ nullable: true })
  coverFilename: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  genre: string;

  @Column({ nullable: true })
  tags: string;

  @Column({ nullable: true })
  waveform: string;

  @Column({ nullable: true })
  album: string;

  @Column({ nullable: true })
  artist: string;

  @Column({ nullable: true })
  albumartist: string;

  @Column({ nullable: true })
  year: number;

  @Column({ nullable: true })
  composer: string;

  @Column({ nullable: true })
  lyrics: string;

  @Column({ default: 'PUBLIC' })
  status: string;

  @Column()
  audioUrl: string;

  @Column()
  imageUrl: string;

  @ManyToOne(() => User, (user) => user.musics, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToMany(() => User, (user) => user.likedMusics)
  likedByUsers: User[];

  @ManyToMany(() => Playlist, (playlist) => playlist.musics)
  playlists: Playlist[];
}

// History
// @ApiProperty({
//   required: false,
//   type: () => History,
//   isArray: true,
//   description: '재생기록',
// })
// @OneToMany(() => History, (history) => history.music)
// history: History[];
//
// @ApiProperty({ required: false, type: () => User, isArray: true })
// @ManyToMany(() => User, (user) => user.repostMusics, { onDelete: 'CASCADE' })
// reposts: User[];
// @ApiProperty({ required: false, type: () => User, isArray: true })
// @ManyToMany(() => User, (user) => user.likeMusics, { onDelete: 'CASCADE' })
// likes: User[];
// @ApiProperty({
//   required: false,
//   type: () => Playlist,
//   isArray: true,
//   description: '속한 플레이리스트 목록',
// })
// @ManyToOne(() => User, (user) => user.musics, {
//   cascade: true,
//   onDelete: 'CASCADE',
// })
// user: User;

// @ManyToMany(() => User, (user) => user.likedMusics)
// likedByUsers: User[];

// // @ApiProperty({ required: false, type: () => Comment, isArray: true })
// // @OneToMany(() => Comment, (comment) => comment.music, { onDelete: 'CASCADE' })
// // comments: Comment[];
//
// // Date
// @ApiProperty()
// @CreateDateColumn()
// createdAt: Date;
// @ApiProperty()
// @UpdateDateColumn()
// updatedAt: Date;

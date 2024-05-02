import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Music } from '../music/music.entity';
// import { Playlist } from '../playlist/playlist.entity';
// import { History } from '../history/history.entity';
// import { ApiProperty } from '@nestjs/swagger';
// import { Comment } from '../comment/comment.entity';

@Entity()
export class User {
  // 회원가입 및 유저정보
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  nickname: string;

  @Column({ nullable: true })
  description: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  // User Likes & Reposts
  // @ManyToMany(() => Music, (music) => music.likes, {
  //   cascade: true,
  //   onDelete: 'CASCADE',
  // })
  @JoinTable()
  likeMusics: Music[];
  //
  // @ManyToMany(() => Music, (music) => music.reposts, {
  //   cascade: true,
  //   onDelete: 'CASCADE',
  // })
  // @JoinTable()
  // repostMusics: Music[];
  //
  // @ManyToMany(() => Playlist, (playlist) => playlist.likes, {
  //   cascade: true,
  //   onDelete: 'CASCADE',
  // })
  // @JoinTable()
  // likePlaylists: Playlist[];
  //
  // @ManyToMany(() => Playlist, (playlist) => playlist.reposts, {
  //   cascade: true,
  //   onDelete: 'CASCADE',
  // })
  // @JoinTable()
  // repostPlaylists: Playlist[];
  //
  // // Follow
  // @ManyToMany(() => User, (user) => user.following, { onDelete: 'CASCADE' })
  // followers: User[];
  //
  // @ManyToMany(() => User, (user) => user.followers, { onDelete: 'CASCADE' })
  // @JoinTable()
  // following: User[];
  //
  // // User Relation column
  @OneToMany(() => Music, (music) => music.user, {
    eager: true,
    onDelete: 'CASCADE',
  })
  musics: Music[];
  //
  // @OneToMany(() => Playlist, (playlist) => playlist.user, {
  //   eager: true,
  //   onDelete: 'CASCADE',
  // })
  // playlists: Playlist[];
  //
  // @OneToMany(() => Comment, (comment) => comment.user, { onDelete: 'CASCADE' })
  // comments: Comment[];
  //
  // // History
  // @OneToMany(() => History, (history) => history.user)
  // historys: History[];
  //
  // // Date
  // @CreateDateColumn()
  // createdAt: Date;
  //
  // @UpdateDateColumn()
  // updatedAt: Date;
}

import { Music } from '../music/music.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToMany,
  JoinTable,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../auth/auth.entity';
import { EntityStatus } from '../common/common.types';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

@Entity()
export class Playlist {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  name: string;
  @ApiProperty({ description: '고유주소' })
  @Column()
  permalink: string;
  @ApiProperty({ enum: ['PRIVATE', 'PUBLIC'], default: 'PUBLIC' })
  @Column({ default: EntityStatus.PUBLIC })
  status: EntityStatus;

  // Optional Info
  // @ApiProperty({ description: '플레이리스트 커버 이미지 경로' })
  // @Column({ nullable: true })
  // image: string;
  // @ApiProperty({ required: false, description: 'Firebase에 저장된 파일명' })
  // @Column({ nullable: true })
  // imageFilename: string;
  // @ApiProperty()
  // @Column({ nullable: true })
  // description: string;
  // @ApiProperty({ type: String, isArray: true })
  // @Column({ nullable: true })
  // tags: string; // 여러 태그를 쉼표로 구분하여 저장할 문자열
  // @ApiHideProperty()
  // @Column({ nullable: true, select: false })
  // tagsLower: string; // tags와 동일하게 태그를 쉼표로 구분하여 저장하되, 검색을 위해 소문자로 저장한 문자열
  //
  // // Create User
  // @ApiProperty({ required: false, description: '생성한 유저ID' })
  // @Column({ nullable: true, name: 'userId' })
  // userId: string;
  // @ApiProperty({ required: false, type: User })
  // @ManyToOne(() => User, (user) => user.playlists, {
  //   cascade: true,
  //   onDelete: 'CASCADE',
  // })
  // @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  // user: User;
  //
  // @ApiProperty({ required: false, type: User, isArray: true })
  // @ManyToMany(() => User, (user) => user.repostPlaylists, {
  //   onDelete: 'CASCADE',
  // })
  // reposts: User[];
  // @ApiProperty({ required: false, type: User, isArray: true })
  // @ManyToMany(() => User, (user) => user.likePlaylists, { onDelete: 'CASCADE' })
  // likes: User[];
  //
  // // Music in Playlist
  // @ApiProperty({
  //   type: Music,
  //   isArray: true,
  //   description: '플레이리스트에 속한 음악',
  // })
  // @ManyToMany(() => Music, (music) => music.playlists, {
  //   eager: true,
  //   cascade: true,
  //   onDelete: 'CASCADE',
  // })
  @JoinTable()
  musics: Music[];
  //
  // @ApiProperty()
  // @CreateDateColumn()
  // createdAt: Date;
  // @ApiProperty()
  // @UpdateDateColumn()
  // updatedAt: Date;
}

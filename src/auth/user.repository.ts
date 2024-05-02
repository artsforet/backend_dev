// // import { AuthRegisterDto } from './dto/auth-register.dto';
// import { User } from './auth.entity';
// import {
//   // Entity,
//   // EntityRepository,
//   Repository,
//   // SelectQueryBuilder,
// } from 'typeorm';
// import {
//   BadRequestException,
//   ConflictException,
//   // BadRequestException,
//   // ConflictException,
//   InternalServerErrorException,
//   // InternalServerErrorException,
// } from '@nestjs/common';
// import { AuthRegisterDto } from './dto/auth-register.dto';
// import { Injectable } from '@nestjs/common';
// // import { InjectRepository } from '@nestjs/typeorm';
// // import { PagingDto } from 'src/common/dto/paging.dto';
//
// @Injectable()
// export class UserRepository extends Repository<User> {
//   getDetailQuery() {
//     return (
//       this.getSimpleQuery()
//         .leftJoinAndSelect('user.musics', 'musics')
//         // .leftJoinAndSelect('user.playlists', 'playlists')
//         .leftJoinAndSelect('playlists.musics', 'pm')
//     );
//     // .leftJoinAndSelect('pm.user', 'pmu')
//     // .leftJoinAndSelect('user.likeMusics', 'lm')
//     // .leftJoinAndSelect('user.repostMusics', 'rm')
//     // .leftJoinAndSelect('user.likePlaylists', 'lp')
//     // .leftJoinAndSelect('user.repostPlaylists', 'rp')
//     // .leftJoinAndSelect('lm.user', 'lmu')
//     // .leftJoinAndSelect('rm.user', 'rmu')
//     // .leftJoinAndSelect('lp.user', 'lpu')
//     // .leftJoinAndSelect('rp.user', 'rpu')
//     // .leftJoinAndSelect('user.followers', 'followers')
//     // .leftJoinAndSelect('user.following', 'following')
//     // .loadRelationCountAndMap(
//     //   'followers.followersCount',
//     //   'followers.followers',
//     // )
//     // .loadRelationCountAndMap(
//     //   'following.followersCount',
//     //   'following.followers',
//     // );
//   }
//
//   async createUser(authRegisterlDto: AuthRegisterDto): Promise<void> {
//     const user = this.create(authRegisterlDto);
//
//     try {
//       await this.save(user);
//     } catch (error) {
//       if (error.code === '23505') {
//         throw new ConflictException('Existing username');
//       } else {
//         console.log(error);
//         throw new InternalServerErrorException(error, 'Error to create user');
//       }
//     }
//   }
//
//   async findUserByUsername(email: string): Promise<User> {
//     // const user = await this.getDetailQuery()
//     //   .addSelect('user.password')
//     //   .where('user.email = :email', { where: { email } })
//     //   .getOne();
//     console.log(email);
//     const user = await this.findOne({ where: { email } });
//     debugger;
//     console.log('[]FINDUSERBYUSERNAME_USERNAME :' + email + '[USER]' + user);
//     if (!user) {
//       throw new BadRequestException({}, `Can't find User with id: ${email}`);
//     }
//     console.log(user);
//     return user;
//   }
//
//   async save(body) {
//     return await this.save(body);
//   }
//
//   async update(id: number, options) {
//     return await this.update(id, options);
//   }
//
//   // orderSelectQuery(query: SelectQueryBuilder<User>) {
//   //   return query
//   //     .addSelect((subQuery) => {
//   //       return subQuery
//   //         .select('COUNT(f.id)', 'count')
//   //         .from(User, 'f')
//   //         .where('f.id = followers.id');
//   //     }, 'fcount')
//   //     .orderBy('fcount', 'DESC');
//   // }
//
//   getSimpleQuery() {
//     return this.createQueryBuilder('user')
//       .loadRelationCountAndMap('user.followersCount', 'user.followers')
//       .loadRelationCountAndMap('user.followingCount', 'user.following')
//       .loadRelationCountAndMap('user.playlistsCount', 'user.playlists')
//       .loadRelationCountAndMap('user.likeMusicsCount', 'user.likeMusics')
//       .loadRelationCountAndMap('user.repostMusicsCount', 'user.repostMusics')
//       .loadRelationCountAndMap('user.likePlaylistsCount', 'user.likePlaylists')
//       .loadRelationCountAndMap(
//         'user.repostPlaylistsCount',
//         'user.repostPlaylists',
//       )
//       .loadRelationCountAndMap('user.commentsCount', 'user.comments')
//       .loadRelationCountAndMap('user.musicsCount', 'user.musics');
//   }
//
//   // async findUserByUsername(username: string): Promise<User> {
//   //   const user = await this.getDetailQuery()
//   //     .addSelect('user.hashedRefreshToken')
//   //     .addSelect('user.password')
//   //     .where('user.username = :username', { username })
//   //     .getOne();
//   //
//   //   if (!user) {
//   //     throw new BadRequestException({}, `Can't find User with id: ${username}`);
//   //   }
//   //
//   //   return user;
//   // }
//   //
//   // async findUserById(id: string, nullable?: boolean) {
//   //   const user = await this.getDetailQuery()
//   //     .where('user.id = :id', { id })
//   //     .getOne();
//   //
//   //   if (!user) {
//   //     if (nullable) {
//   //       return null;
//   //     } else {
//   //       throw new BadRequestException(`Can't find User with id: ${id}`);
//   //     }
//   //   }
//   //
//   //   return user;
//   // }
//   //
//   // async getRandomUsers() {
//   //   try {
//   //     const ids = (
//   //       await this.createQueryBuilder('user').select('user.id').getMany()
//   //     ).map((value) => value.id);
//   //
//   //     const maxLength = ids.length < 4 ? ids.length : 4;
//   //     const randomIds: string[] = [];
//   //
//   //     while (randomIds.length < maxLength) {
//   //       const randomIndex = Math.floor(Math.random() * ids.length);
//   //       const item = ids[randomIndex];
//   //       if (!randomIds.includes(item)) {
//   //         randomIds.push(item);
//   //       }
//   //     }
//   //
//   //     return this.getSimpleQuery().whereInIds(randomIds).getMany();
//   //   } catch (error) {
//   //     throw new InternalServerErrorException(error, 'Error to get musics');
//   //   }
//   // }
//   //
//   // async searchUser(keyward: string, pagingDto: PagingDto) {
//   //   const { skip, take } = pagingDto;
//   //
//   //   try {
//   //     const query = this.getDetailQuery().where(
//   //       'LOWER(user.nickname) LIKE :nickname',
//   //       {
//   //         nickname: `%${keyward}%`,
//   //       },
//   //     );
//   //     return this.orderSelectQuery(query).skip(skip).take(take).getMany();
//   //   } catch (error) {
//   //     throw new InternalServerErrorException(error, 'Error to search user');
//   //   }
//   // }
//   //
//   // async updateUser(user: User) {
//   //   try {
//   //     const updatedUser = await this.save(user);
//   //     return updatedUser;
//   //   } catch (error) {
//   //     throw new InternalServerErrorException(
//   //       error,
//   //       `Error to update user, user ID: ${user.id}`,
//   //     );
//   //   }
//   // }
//   //
//   // async updateRefreshToken(user: User, hashedRefreshToken?: string) {
//   //   try {
//   //     await this.createQueryBuilder()
//   //       .update(User)
//   //       .set({ hashedRefreshToken })
//   //       .where('id = :id', { id: user.id })
//   //       .execute();
//   //   } catch (error) {
//   //     throw new InternalServerErrorException(
//   //       error,
//   //       'Error to update refreshToken',
//   //     );
//   //   }
//   // }
//   //
//   // async deleteUser(user: User): Promise<void> {
//   //   try {
//   //     const result = await this.delete({ id: user.id });
//   //     if (result.affected === 0) {
//   //       throw new InternalServerErrorException(
//   //         `Can't find user with id ${user.id}`,
//   //       );
//   //     }
//   //   } catch (error) {
//   //     throw new InternalServerErrorException(error, 'Error to delete user');
//   //   }
//   // }
// }

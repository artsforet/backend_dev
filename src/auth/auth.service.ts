// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { User } from './auth.entity';
// import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
// import { AuthCredentailDto } from './dto/dto/auth-credential.dto';
import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
// import { HistoryRepository } from '../history/history.repository';
// import typeorm_1 from 'typeorm';
import { User } from './auth.entity';
import { AuthCredentailDto } from './dto/dto/auth-credential.dto';
import { JwtService } from '@nestjs/jwt';
import { Playlist } from '../playlist/playlist.entity';
import { PlaylistRepository } from '../playlist/playlist.repository';
// import { History } from "../history/history.entity";

// import { Music } from '../music/music.entity';
// import { User } from './auth.entity';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: any,
    private readonly jwtService: JwtService,
    @InjectRepository(Playlist)
    private playlistRepository: PlaylistRepository,
    // @InjectRepository(History)
    // private historyRepository: HistoryRepository,
  ) {}
  // constructor(
  //   // @InjectRepository(User)
  //   protected readonly userRepository: UserRepository,
  // ) {}

  async comparePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<void> {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    if (!isMatch) {
      throw new HttpException('Wrong Password', 401);
    }
  }
  async findOne(options) {
    return this.userRepository.findOne(options);
  }
  async validateUser(authCredentailDto: AuthCredentailDto) {
    const { email, password } = authCredentailDto;
    const user = await this.userRepository.findByName(email);
    await this.comparePassword(password, user.password);
    return { user };
  }
  // 사용자 ID를 이용하여 사용자를 찾는 메서드
  async findUserById(id: string) {
    return this.findById(id);
  }

  async validateUserById(id: number): Promise<any> {
    return this.findOne({ where: { id } });
  }
  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async userForPlaylist(id: number): Promise<User> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['playlists'],
    });
  }

  async addSongToPlaylist(userId: number, title: string): Promise<any> {
    if (!this.playlistRepository[userId]) {
      this.playlistRepository[userId] = [];
    }
    this.playlistRepository[userId].push(title);
  }

  async getPlaylistsByUserId(userId: string): Promise<Playlist> {
    return this.playlistRepository[userId] || [];
  }

  // async addSongToPlaylist(userId: number, title: string): Promise<Playlist> {
  //   const user = await this.userForPlaylist(userId);
  //   const playlist = new Playlist();
  //   playlist.name = title;
  //   playlist.user = user;
  //   return this.playlistRepository.save(playlist);
  // }


  async findPlaylistsByUserId(userId: number): Promise<Playlist[]> {
    const user = await this.userForPlaylist(userId);
    console.log(user);
    return user.playlists;
  }

  async Validate(req: any) {
    // 여기서 사용자 정보를 가져오는 로직을 작성
    // 예를 들어, 헤더에서 JWT 토큰을 추출하여 토큰을 해독하여 사용자 ID를 가져오고,
    // 해당 ID를 이용하여 데이터베이스에서 사용자를 찾습니다.
    // 실제로는 사용자 인증 방법에 따라 다를 수 있습니다.
    const userId = req.user; // 예시: 요청 객체에서 사용자 ID를 가져옴
    if (!userId) {
      return null; // 사용자 ID가 없으면 null을 반환
    }
    return this.findUserById(userId); // 사용자 ID를 이용하여 사용자를 찾아 반환
  }
  async save(body) {
    return this.userRepository.save(body);
  }

  async findByName(name: string): Promise<User> {
    return this.userRepository.findOne({ where: { name } });
  }

  async findById(id: string): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }
  // eslint-disabl
  // eslint-disable-next-line prettier/prettier
  async update(id: number, options) {
    return this.userRepository.update(id, options);
  }

  // async validateUser(payload: any) {
  //   // JWT 토큰에서 추출된 사용자 정보를 검증하고 유효한 사용자인지 확인하는 비즈니스 로직을 작성합니다.
  //
  //   // 여기서는 사용자 ID를 받아와서 데이터베이스에서 해당 사용자를 조회하는 예시를 보여줍니다.
  //   const userId = payload.id;
  //
  //   // 실제 프로젝트에서는 데이터베이스나 다른 저장소에서 사용자를 조회하는 로직을 구현해야 합니다.
  //   // 여기서는 예시로 UserService를 사용하여 사용자를 조회합니다.
  //   const user = await this.findById(userId);
  //
  //   if (user) {
  //     // 사용자가 존재한다면 사용자 객체를 반환합니다.
  //     return user;
  //   } else {
  //     // 사용자가 존재하지 않는다면 예외를 발생시킵니다.
  //     throw new UnauthorizedException('Invalid user');
  //   }
  // }
}

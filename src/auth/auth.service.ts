// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { User } from './auth.entity';
// import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
// import { AuthCredentailDto } from './dto/dto/auth-credential.dto';
import { HttpException, Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from 'bcryptjs';
// import { HistoryRepository } from '../history/history.repository';
// import typeorm_1 from 'typeorm';
import { User } from './auth.entity';
// import { History } from "../history/history.entity";

// import { Music } from '../music/music.entity';
// import { User } from './auth.entity';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: any,
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
  // async validateUser(authCredentailDto: AuthCredentailDto) {
  //   const { email, password } = authCredentailDto;
  //   console.log(email);
  //   const user = await this.userRepository.findUserByUsername(email);
  //   console.log(user);
  //   await this.comparePassword(password, user.password);
  //   return { user };
  // }

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

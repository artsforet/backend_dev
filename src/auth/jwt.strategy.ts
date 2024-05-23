import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from "./auth.service";
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: (req: Request) => {
        let token = null;
        if (req && req.headers) {
          token = req.headers.authorization;
          if (token && token.startsWith('Bearer ')) {
            token = token.slice(7, token.length); // "Bearer " 접두사 잘라내기
          }
        }
        return token;
      },
      ignoreExpiration: false,
      secretOrKey: 'secret', // 환경 변수로 관리하는 것이 좋습니다
    });
  }
  // async validate(payload: any) {
  //   // JWT 토큰에서 추출된 사용자 정보를 검증하고 유효한 사용자인지 확인하는 로직을 작성합니다.
  //   // 주로 사용자 조회 등의 비즈니스 로직을 수행합니다.
  //   return this.authService.validateUser(payload); // AuthService에서 사용자 검증을 수행합니다.
  // }

  async validate(payload: any) {
    const user = await this.authService.validateUserById(payload.id);
    if (!user) {
      throw new UnauthorizedException();
    }
    return { userId: user.id, email: payload.email };
  }
}

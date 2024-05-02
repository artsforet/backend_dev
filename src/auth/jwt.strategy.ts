// jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'secret', // JWT 서명에 사용된 비밀 키와 동일한 값을 입력합니다.
    });
  }
  // async validate(payload: any) {
  //   // JWT 토큰에서 추출된 사용자 정보를 검증하고 유효한 사용자인지 확인하는 로직을 작성합니다.
  //   // 주로 사용자 조회 등의 비즈니스 로직을 수행합니다.
  //   return this.authService.validateUser(payload); // AuthService에서 사용자 검증을 수행합니다.
  // }
}

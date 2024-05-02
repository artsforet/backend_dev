import {
  BadRequestException,
  Body,
  Controller, Get,
  Post,
  Req,
  Res,
  UnauthorizedException
} from "@nestjs/common";
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { TokenService } from './token.service';
import { MoreThanOrEqual } from 'typeorm';
// import { AuthCredentailDto } from './dto/dto/auth-credential.dto';
@ApiTags('AUTH')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private tokenService: TokenService,
  ) {}
  @Post('register')
  async register(@Body() body: any) {
    if (body.password !== body.password_confirm) {
      throw new BadRequestException('패스워드가 일치하지 않습니다.');
    }

    return this.authService.save({
      name: body.name,
      nickname: body.nickname,
      description: body.description,
      email: body.email,
      password: await bcryptjs.hash(body.password, 12),
    });
  }
  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!(await bcryptjs.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.jwtService.signAsync(
      {
        id: user.id,
      },
      { expiresIn: '30s' },
    );

    const refreshToken = await this.jwtService.signAsync({
      id: user.id,
    });

    const expired_at = new Date();
    expired_at.setDate(expired_at.getDate() + 7);

    await this.tokenService.save({
      user_id: user.id,
      token: refreshToken,
      expired_at,
    });

    response.status(200);
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return {
      token: accessToken,
    };
  }
  @Get('user')
  async user(@Req() request: Request) {
    try {
      // const accessToken = request.headers.authorization.replace('Bearer', '');
      const accessToken = request.headers.authorization.replace('Bearer', '');
      const { id } = await this.jwtService.verifyAsync(accessToken);
      const { password, ...data } = await this.authService.findOne({
        where: { id },
      });
      // return this.authService.findOne({ where: { id } })
      return data;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  @Post('find')
  async AllFindUser(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    // 유저의 패스워드 혹은 아이디를 확인하기 위해서 암호화된 패스워드와 유저의 정보를 가져오는 토큰 등이 필요한 함수
    // user 조회
    const user = await this.authService.findOne({ email });
    // 이메일 없는지 조회
    if (!user) throw new UnauthorizedException('Invalid credentials');
    // 비밀번호 암호화 체크
    // eslint-disable-next-line
    if (!await bcryptjs.compare(password, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // accessToken  emdsfhr
    const accessToken = await this.jwtService.signAsync(
      {
        id: user.id,
      },
      { expiresIn: '30s' },
    );
    // 리프레쉬 토큰을 통한 새로고침 토큰 등록
    const refreshToken = await this.jwtService.signAsync({
      id: user.id,
    });

    // 현재 날짜 조회
    const expired_at = new Date();
    // 유효기간 날짜 ㅈ지정
    expired_at.setDate(expired_at.getDate() + 7);
    // 토큰에 집어넣기 => 토큰을 받아오는 건 디비 토큰
    await this.tokenService.save({
      user_id: user.id,
      token: refreshToken,
      expired_at,
    });
    // status 강제 201 뜨는거 200으로 수정
    response.status(200);
    // 쿠키 등록하기 응답한 리프레쉬 토큰으로 재발급
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    // return 값으로 토큰에 어세스 토큰을 등록 =
    // 이렇게 고유한 토큰값은 서버에 저장되고 유저 인증을 위한 암호화 토큰으로 존재
    return {
      token: accessToken,
    };
  }

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const refreshToken = request.cookies['refresh_token'];
      const { id } = await this.jwtService.verifyAsync(refreshToken);
      const tokenEntity = await this.tokenService.findOne({
        where: {
          user_id: id,
          expired_at: MoreThanOrEqual(new Date()),
        },
      });
      if (!tokenEntity) {
        throw new UnauthorizedException();
      }
      const accessToken = await this.jwtService.signAsync(
        { id },
        { expiresIn: '30s' },
      );

      response.status(200);
      return { token: accessToken };
    } catch (errorMessage) {
      throw new UnauthorizedException();
    }
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('refresh_token');
    return { message: 'success clear refreh_token' };
  }
}

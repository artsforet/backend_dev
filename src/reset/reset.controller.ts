import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { ResetService } from './reset.service';
import { MailerService } from '@nestjs-modules/mailer';
import { AuthService } from '../auth/auth.service';
import * as bcryptjs from 'bcryptjs';
@Controller()
export class ResetController {
  constructor(
    private resetService: ResetService,
    private mailerService: MailerService,
    private authService: AuthService,
  ) {}
  @Post('forgot')
  async forgot(@Body('email') email: string) {
    const token = Math.random().toString(20).substring(2, 12);
    await this.resetService.save({
      email,
      token,
    });
    const url = `http://localhost:8000/reset/${token}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset your password',
      html: `Click <a href="${url}">here</a> to reset your password`,
    });
    return {
      message: 'Check your Email or TEST_MODE: localhost:8025',
    };
  }

  @Post('reset')
  async reset(
    @Body('token') token: string,
    @Body('password') password: string,
    @Body('password_confirm') password_confirm: string,
  ) {
    if (password !== password_confirm) {
      throw new BadRequestException('Password do not match');
    }
    const reset = await this.resetService.findOne({ where: { token } });
    console.log(reset);
    const user = await this.authService.findOne({
      where: {
        email: reset.email,
      },
    });
    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    await this.authService.update(user.id, {
      password: await bcryptjs.hash(password, 12),
    });

    return {
      message: 'success',
    };
  }
}

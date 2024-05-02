import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reset } from './reset.entity';
import { ResetService } from './reset.service';
import { ResetController } from './reset.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reset]),
    MailerModule.forRoot({
      transport: {
        host: '0.0.0.0',
        port: 1025,
      },
      defaults: {
        from: 'canyon920@gmail.com',
      },
    }),
    AuthModule,
  ],
  controllers: [ResetController],
  providers: [ResetService],
})
export class ResetModule {}

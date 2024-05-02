import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class AuthCredentailDto {
  @ApiProperty({
    required: true,
    description: '로그인 이메일',
    // minLength: 6,
    // maxLength: 20,
  })
  @IsString()
  // @MinLength(6)
  // @MaxLength(20)
  email: string;

  @ApiProperty({ required: true, minLength: 6, maxLength: 20 })
  @IsString()
  // @MinLength(6)
  // @MaxLength(20)
  // @Matches(/(?=.*[a-z|A-Z])(?=.*[0-9])[a-zA-Z0-9#?!@$%^&*-]{6,20}$/, {
  //   message: 'password only accepts english, number and special',
  // })
  password: string;
}

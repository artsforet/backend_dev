import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './auth.entity';
import { Token } from './token.entity';
export class TokenService {
  constructor(
    @InjectRepository(Token)
    protected readonly userRepository: Repository<Token>,
  ) {}
  async save(body) {
    return this.userRepository.save(body);
  }
  async findOne(options) {
    return this.userRepository.findOne(options);
  }
}

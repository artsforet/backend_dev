import { HistoryRepository } from './history.repository';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';
import { History } from './history.entity';
import { Music } from '../music/music.entity';
import { MusicRepository } from '../music/music.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Music, History]), AuthModule],
  controllers: [HistoryController],
  providers: [HistoryService, HistoryRepository, MusicRepository],
})
export class HistoryModule {}

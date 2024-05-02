import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { User } from '../auth/auth.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Music } from '../music/music.entity';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class CommentRepository extends Repository<Comment> {
  getDetailQuery() {
    return this.createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.music', 'music');
  }

  async findCommentsByUserId(userId: string) {
    try {
      return this.getDetailQuery()
        .where('comment.userId = :userId', {
          userId,
        })
        .getMany();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error, 'Error to get comments');
    }
  }

  async createComment(
    user: User,
    music: Music,
    createCommentDto: CreateCommentDto,
  ) {
    const { text, commentedAt } = createCommentDto;
    const comment = this.create({ user, music, text, commentedAt });

    try {
      await this.save(comment);
      return comment;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        error,
        `Error ocuur create comment.`,
      );
    }
  }

  async deleteComment(commentId: number) {
    try {
      const result = await this.delete({ id: commentId });
      if (result.affected === 0) {
        throw new NotFoundException(`Can't find Comment with id ${commentId}`);
      }
    } catch (error) {
      throw new InternalServerErrorException(error, 'Error to delete comment');
    }
  }
}

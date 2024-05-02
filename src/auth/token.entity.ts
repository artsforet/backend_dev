import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: string;

  @Column({ nullable: true, select: false })
  token: string;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  expired_at: Date;
}

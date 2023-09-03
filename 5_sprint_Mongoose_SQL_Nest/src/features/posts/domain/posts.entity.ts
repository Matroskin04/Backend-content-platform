import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from '../../users/domain/users.entity';
import { Blogs } from '../../blogs/domain/blogs.entity';
import { Comments } from '../../comments/domain/comments.entity';
import { PostsLikesInfo } from './posts-likes-info.entity';

@Entity()
export class Posts {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 30 })
  title: string;

  @Column({ length: 100 })
  shortDescription: string;

  @Column({ length: 1000 })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Users, (u) => u.post)
  @JoinColumn()
  user: Users;
  @Column()
  userId: string;

  @ManyToOne(() => Blogs, (b) => b.post)
  @JoinColumn()
  blog: Blogs;
  @Column()
  blogId: string;

  @OneToMany(() => Comments, (c) => c.post)
  comment: Comments[];

  @OneToMany(() => PostsLikesInfo, (li) => li.post)
  postLikeInfo: PostsLikesInfo[];
}

import { UserEntity } from 'src/user/model/user.entity';
import {
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('blog_entry')
export class BlogEntryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  slug: string;

  @Column()
  description: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }

  @Column({ default: 0 })
  likes: number;

  @Column()
  headerImage: string;

  @Column({ nullable: true })
  publishedDate: Date;

  @Column({ default: false })
  isPublished: boolean;

  @ManyToOne((type) => UserEntity, (user) => user.blogEntries, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  author: UserEntity;
}

import { UserEntity } from 'src/user/model/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeUpdate,
  ManyToOne,
} from 'typeorm';

@Entity('blog_entry') // definimos el nombre que tendrá la tabla.
export class BlogEntryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({
    default: '',
  })
  description: string;

  @Column({
    default: '',
  })
  body: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }

  @Column({
    default: 0,
  })
  likes: number;

  @Column({
    default: '',
  })
  headerImage: string;

  @Column()
  publishedDate: Date;

  @Column({
    default: false,
  })
  isPublished: boolean;

  @ManyToOne((type) => UserEntity, (user) => user.blogEntries)
  author: UserEntity;
}

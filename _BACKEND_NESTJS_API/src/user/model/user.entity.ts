import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import { UserRole } from './user.interface';
import { BlogEntryEntity } from 'src/blog/model/blog-entry.entity';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
    // nullable: true, // This is important to avoid errors when creating a new user
  })
  role: UserRole;

  @BeforeInsert()
  emailToLowerCase() {
    this.email = this.email.toLowerCase();
  }

  @OneToMany(
    (type) => BlogEntryEntity,
    (blogEntryEntity) => blogEntryEntity.author,
    { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' }, // NO borraremos físicamente, el update habría que mirarlo
  )
  blogEntries: BlogEntryEntity[];
}

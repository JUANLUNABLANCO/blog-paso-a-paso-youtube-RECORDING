import { UserReadWhithoutEntriesDto } from 'src/user/model/user.dto';
import { IUserBase } from '../../user/model/user.interface';

export interface IBlogEntry {
  id?: number;
  title?: string;
  slug?: string;
  description?: string;
  body?: string;
  createdAt?: Date;
  updatedAt?: Date;
  likes?: number;
  // WARNING no queremos que haya recursión infinita IUserBase --> UserReadWhitoutEntriesDto
  author?: UserReadWhithoutEntriesDto;
  headerImage?: string;
  publishedDate?: Date;
  isPublished?: boolean;
}

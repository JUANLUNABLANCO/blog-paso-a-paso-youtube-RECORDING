import { BlogEntryReadWithoutAuthorDto } from 'src/blog/model/blog-entry.dto';

export enum UserRole {
  ADMIN = 'admin',
  CHIEFEDITOR = 'chiefeditor',
  EDITOR = 'editor',
  USER = 'user',
}

export interface IUserBase {
  id?: number;
  userName?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  profileImage?: string;
  // blogEntries?: IBlogEntry[];
  blogEntries?: BlogEntryReadWithoutAuthorDto[];
}

export interface File {
  profileImage: string;
}

import { BlogEntry } from 'src/blog/model/blog-entry.interface';

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
  blogEntries?: BlogEntry[];
}

export interface File {
  profileImage: string;
}

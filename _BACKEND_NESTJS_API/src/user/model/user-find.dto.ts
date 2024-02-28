import { BlogEntry } from 'src/blog/model/blog-entry.interface';
import { UserRole } from './user.interface';

export interface IUserFindResponse {
  id: number;
  userName: string;
  email: string;
  role: UserRole;
  profileImage: string | null;
  blogEntries: BlogEntry[]; // blogEntries: BlogEntry[] | []; puede ser un array vacío
}

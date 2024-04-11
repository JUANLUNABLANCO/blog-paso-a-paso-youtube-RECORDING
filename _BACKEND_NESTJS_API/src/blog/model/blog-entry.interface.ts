import { IUserBase } from '../../user/model/user.interface';

export interface BlogEntry {
  id?: number;
  title?: string;
  slug?: string;
  description?: string;
  body?: string;
  createdAt?: Date;
  updatedAt?: Date;
  likes?: number;
  author?: IUserBase;
  headerImage?: string;
  publishedDate?: Date;
  isPublished?: boolean;
}

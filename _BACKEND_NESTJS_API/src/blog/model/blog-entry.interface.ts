import { IUser } from 'src/user/model/user.interface';

export interface BlogEntry {
  id?: number;
  title?: string;
  slug?: string;
  description?: string;
  body?: string;
  createdAd?: Date;
  updatedAt?: Date;
  likes?: number;
  headerImage?: string;
  publishedDate?: Date;
  isPublished?: boolean;
  author?: IUser;
}

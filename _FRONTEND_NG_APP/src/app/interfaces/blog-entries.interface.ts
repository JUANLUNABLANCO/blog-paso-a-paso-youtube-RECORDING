import { IUser } from './user.interface';

export interface IBlogEntry {
  id?: number;
  title?: string;
  slug?: string;
  description?: string;
  body?: string;
  createdAt?: Date;
  updatedAt?: Date;
  likes?: number;
  author?: IUser;
  headerImage?: string;
  publishedDate?: Date;
  isPublished?: boolean;
}

export interface IBlogEntriesPageable {
  items: IBlogEntry[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
  links: {
    first: string;
    previous: string;
    next: string;
    last: string;
  };
}

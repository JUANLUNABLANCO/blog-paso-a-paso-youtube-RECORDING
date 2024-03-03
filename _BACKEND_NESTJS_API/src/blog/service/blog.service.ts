import { Injectable } from '@nestjs/common';
import { Observable, from, map, of, switchMap } from 'rxjs';
import { BlogEntry } from '../model/blog-entry.interface';
import { IUser } from 'src/user/model/user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntryEntity } from '../model/blog-entry.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/service/user.service';

import slugify from 'slugify';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogEntryEntity)
    private readonly blogRepository: Repository<BlogEntryEntity>,
    private userService: UserService,
  ) {}

  create(user: IUser, blogEntry: BlogEntry): Observable<BlogEntry> {
    blogEntry.author = user;
    return this.generateSlug(blogEntry.title).pipe(
      switchMap((slug: string) => {
        blogEntry.slug = slug;
        return from(this.blogRepository.save(blogEntry));
      }),
    );
  }

  findAll(): Observable<BlogEntry[]> {
    return from(this.blogRepository.find());
  }

  paginateAll(options: IPaginationOptions): Observable<Pagination<BlogEntry>> {
    return from(
      paginate<BlogEntry>(this.blogRepository, options, {
        relations: ['author'],
      }),
    ).pipe(map((blogEntries: Pagination<BlogEntry>) => blogEntries));
  }
  paginateByUser(
    options: IPaginationOptions,
    authorId: number,
  ): Observable<Pagination<BlogEntry>> {
    return from(
      paginate<BlogEntry>(this.blogRepository, options, {
        relations: ['author'],
        where: [{ author: { id: authorId } }],
      }),
    ).pipe(map((blogEntries: Pagination<BlogEntry>) => blogEntries));
  }

  findOne(id: number): Observable<BlogEntry> {
    return from(
      this.blogRepository.findOne({
        where: { id: id },
        relations: ['author'],
      }),
    );
  }
  findByUser(userId: number): Observable<BlogEntry[]> {
    return from(
      this.blogRepository.find({
        where: {
          author: {
            id: userId,
          },
        },
        relations: { author: true },
      }),
    ).pipe(map((blogEntries: BlogEntry[]) => blogEntries));
  }
  updateOne(id, blogEntry): Observable<BlogEntry> {
    return from(this.blogRepository.update(Number(id), blogEntry)).pipe(
      switchMap(() => this.findOne(id)),
    );
  }
  deleteOne(id): Observable<any> {
    return from(this.blogRepository.delete(Number(id)));
  }
  generateSlug(title: string): Observable<string> {
    return of(slugify(title));
  }
}

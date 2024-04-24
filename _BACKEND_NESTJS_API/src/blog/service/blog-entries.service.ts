import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable, catchError, from, map, of, switchMap } from 'rxjs';
import { IBlogEntry } from '../model/blog-entry.interface';
import { IUserBase } from 'src/user/model/user.interface';
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
import {
  BlogEntryCreateDto,
  BlogEntryReadWhithAuthorDto,
  BlogEntryReadWhithoutAuthorDto,
} from '../model/blog-entry.dto';
import {
  UserCreateDto,
  UserReadWhithEntriesDto,
  UserReadWhithoutEntriesDto,
} from 'src/user/model/user.dto';

@Injectable()
export class BlogEntriesService {
  constructor(
    @InjectRepository(BlogEntryEntity)
    private readonly blogRepository: Repository<BlogEntryEntity>,
    private userService: UserService,
  ) {}

  // TODO después del save debe devolver un array de entradas de ese usuario y no el resultado de la BD
  create(
    user: UserReadWhithEntriesDto,
    blogEntry: BlogEntryCreateDto,
  ): Observable<BlogEntryReadWhithAuthorDto> {
    blogEntry.author = user;

    console.log('#### Create: ', blogEntry, user);
    return this.generateSlug(blogEntry.title).pipe(
      switchMap((slug: string) => {
        blogEntry.slug = slug;
        return from(this.blogRepository.save(blogEntry)).pipe(
          switchMap((resultado) => {
            if (!resultado) {
              throw new InternalServerErrorException(
                'Error creating blog entry',
              );
            }
            return this.findOne(resultado.id);
          }),
        );
      }),
    );
  }

  findAll(): Observable<BlogEntryReadWhithAuthorDto[]> {
    return from(this.blogRepository.find({ relations: { author: true } }));
  }

  paginateAll(
    options: IPaginationOptions,
  ): Observable<Pagination<BlogEntryReadWhithAuthorDto>> {
    return from(
      paginate<BlogEntryReadWhithAuthorDto>(this.blogRepository, options, {
        relations: ['author'],
      }),
    ).pipe(
      map(
        (blogEntries: Pagination<BlogEntryReadWhithAuthorDto>) => blogEntries,
      ),
    );
  }
  // WARNING queremos enviar el author cuando ya sabemos quien es??
  paginateByUser(
    options: IPaginationOptions,
    authorId: number,
  ): Observable<Pagination<BlogEntryReadWhithoutAuthorDto>> {
    return from(
      paginate<BlogEntryReadWhithAuthorDto>(this.blogRepository, options, {
        // relations: ['author'],
        where: [{ author: { id: authorId } }],
      }),
    ).pipe(
      map((blogEntries: Pagination<BlogEntryReadWhithoutAuthorDto>) => {
        console.log('#### blogEntries: ', blogEntries);
        return blogEntries;
      }),
    );
  }
  // TODO es necesario? obtienes todas las netradas de un usuario, pero no paginadas
  findByUser(userId: number): Observable<BlogEntryReadWhithoutAuthorDto[]> {
    return from(
      this.blogRepository.find({
        where: {
          author: {
            id: userId,
          },
        },
        relations: { author: true },
      }),
    ).pipe(map((blogEntries: BlogEntryReadWhithoutAuthorDto[]) => blogEntries));
  }

  findOne(id: number): Observable<BlogEntryReadWhithAuthorDto> {
    return from(
      this.blogRepository.findOne({
        where: { id: id },
        relations: ['author'],
      }),
    );
  }

  // TODO switchMap() ??
  updateOne(id, blogEntry): Observable<BlogEntryReadWhithAuthorDto> {
    return from(this.blogRepository.update(Number(id), blogEntry)).pipe(
      switchMap(() => this.findOne(id)),
    );
  }
  deleteOne(id): Observable<any> {
    return from(this.blogRepository.delete(Number(id))).pipe(
      map((resultado) => {
        console.log('#### BORRANDO: ', resultado);
        if (resultado.affected === 0) {
          return {
            message: `Entrada al blog con id ${id} no existe`,
            status: HttpStatus.NOT_FOUND,
          };
        } else {
          return {
            message: `Entrada al blog con id ${id} eliminado correctamente`,
            status: HttpStatus.OK,
          };
        }
      }),
      catchError((err) => {
        console.log('#### err en deleteOne: ', err);
        return `Entrada al blog con id ${id} no pudo ser eliminado`;
        //   throw new InternalServerErrorException(`Error al eliminar la entrada al blog, Un usuario no puede ser eliminado si tiene entradas de blog asociadas.
        //     Borra primero sus entradas.`); // Si una entrada tuviera más dependencias en el futuro, que se yo, `coments` pues habilitas esto
      }),
    );
  }

  generateSlug(title: string): Observable<string> {
    return of(slugify(title));
  }
}

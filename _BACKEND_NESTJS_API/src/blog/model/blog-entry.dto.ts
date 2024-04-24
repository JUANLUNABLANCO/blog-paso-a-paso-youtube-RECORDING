import { IBlogEntry } from './blog-entry.interface';
import {
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
  Matches,
  IsNotEmpty,
  IsNumber,
  Min,
} from 'class-validator';
import { Not } from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserReadWhithEntriesDto } from 'src/user/model/user.dto';

export class BlogEntryCreateDto {
  // TODO hay que transformar este title, limpiandolo de signos de puntuación, espacios laterales, etc.
  @IsString({ message: 'title: Debe ser un string' })
  @MinLength(5, { message: 'title: Debe tener al menos 5 caracteres' })
  @MaxLength(150, { message: 'title: Debe tener menos de 150 caracteres' })
  title: string;

  @IsString({ message: 'description: Debe ser un string' })
  @MinLength(5, { message: 'description: Debe tener al menos 5 caracteres' })
  @MaxLength(150, {
    message: 'description: Debe tener menos de 150 caracteres',
  })
  description: string;

  @IsString({ message: 'body: Debe ser un string' })
  @MinLength(5, { message: 'body: Debe tener al menos 5 caracteres' })
  @MaxLength(150, { message: 'body: Debe tener menos de 150 caracteres' })
  body: string;
  // no queremos que llegue en la serialización, pero necesitamos tenerlo para poder agregarlo al objeto
  @Exclude()
  slug: string;

  @Exclude()
  author: UserReadWhithEntriesDto; // en vez de userEntity
}

export class BlogEntryUpdateDto {
  // WARNING solo estos podrán ser actualizados por el autor
  // title?: string; // CLIENT
  // description?: string; // ENTITY
  // body?: string; // ENTITY
  // likes?: number;  // ENTITY
  // headerImage?: string;  // ENTITY

  @IsOptional()
  @IsString({ message: 'title: Debe ser un string' })
  @MinLength(5, { message: 'title: Debe tener al menos 5 caracteres' })
  @MaxLength(150, { message: 'title: Debe tener menos de 150 caracteres' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'description: Debe ser un string' })
  @MinLength(10, { message: 'description: Debe tener al menos 10 caracteres' })
  @MaxLength(500, {
    message: 'description: Debe tener menos de 500 caracteres',
  })
  description?: string;

  @IsOptional()
  @IsString({ message: 'body: Debe ser un string' })
  @MinLength(500, { message: 'body: Debe tener al menos 500 caracteres' })
  body?: string;

  @IsOptional()
  @IsNumber({}, { message: 'likes: Debe ser un número' })
  @Min(0, { message: 'likes: Debe ser mayor o igual a 0' })
  likes?: number;

  @IsOptional()
  @IsString({ message: 'headerImage: Debe ser un string' })
  headerImage?: string;
}

export type BlogEntryReadWhithAuthorDto = Required<
  Pick<
    IBlogEntry,
    | 'id'
    | 'title'
    | 'slug'
    | 'description'
    | 'body'
    | 'createdAt'
    | 'updatedAt'
    | 'likes'
    | 'author' // BECAREFULL puede ser recursión infinita ... Ya no porque existe este UserReadWhitoutEntriesDto
    | 'isPublished'
    // | 'headerImage' // CAN BE nullable
    // | 'publishedDate' // CAN BE nullable
  >
> &
  Pick<IBlogEntry, 'headerImage' | 'publishedDate'>;

export type BlogEntryReadWhithoutAuthorDto = Required<
  Pick<
    IBlogEntry,
    | 'id'
    | 'title'
    | 'slug'
    | 'description'
    | 'body'
    | 'createdAt'
    | 'updatedAt'
    | 'likes'
    | 'isPublished'
  >
> &
  Pick<IBlogEntry, 'headerImage' | 'publishedDate'>;

export type BlogEntryDeleteDto = Pick<IBlogEntry, 'id'>;

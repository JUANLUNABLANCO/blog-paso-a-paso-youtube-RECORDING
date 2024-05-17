import { Exclude } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { UserReadWithEntriesDto } from 'src/user/model/user.dto';
import { IBlogEntry } from './blog-entry.interface';

export class BlogEntryCreateDto {
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
  body: string;

  @IsString({ message: 'image: Debe ser un string' })
  @IsNotEmpty({ message: 'image: Es requerida' })
  headerImage: string;

  @Exclude()
  slug: string;

  @Exclude()
  author: UserReadWithEntriesDto;
}

export class BlogEntryUpdateDto {
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

export type BlogEntryReadWithAuthorDto = Required<
  Pick<
    IBlogEntry,
    | 'id'
    | 'title'
    | 'slug'
    | 'description'
    | 'body'
    | 'headerImage'
    | 'createdAt'
    | 'updatedAt'
    | 'likes'
    | 'author' // BECAREFULL puede ser recursión infinita ... Ya no porque existe este UserReadWhitoutEntriesDto
    | 'isPublished'
    // | 'headerImage' // CAN BE nullable
    // | 'publishedDate' // CAN BE nullable
  >
> &
  Pick<IBlogEntry, 'publishedDate'>;

export type BlogEntryReadWithoutAuthorDto = Required<
  Pick<
    IBlogEntry,
    | 'id'
    | 'title'
    | 'slug'
    | 'description'
    | 'body'
    | 'headerImage'
    | 'createdAt'
    | 'updatedAt'
    | 'likes'
    | 'isPublished'
  >
> &
  Pick<IBlogEntry, 'publishedDate'>;

export type BlogEntryDeleteDto = Pick<IBlogEntry, 'id'>;

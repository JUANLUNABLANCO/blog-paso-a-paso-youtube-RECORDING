import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
  Matches,
} from 'class-validator';
import { BlogEntry } from 'src/blog/model/blog-entry.interface';

export class UserCreateDto {
  @IsString({ message: 'Name: Debe ser un string' })
  @MinLength(3, { message: 'Name: Debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'Name: Debe tener menos de 50 caracteres' })
  name: string;

  @IsEmail({}, { message: 'Email: Debe ser un email válido' })
  email: string;

  @IsString({ message: 'password: Debe ser un string' })
  @MinLength(8, { message: 'password: Debe tener al menos 8 caracteres' })
  @MaxLength(50, { message: 'password: Debe tener menos de 50 caracteres' })
  password: string;

  @IsOptional()
  @IsString({ message: 'Profile Image:Debe ser un string' })
  @Matches(/^https?:\/\/assets\/images\/[\w.-_]+\.(png|jpg)$/, {
    message: 'Invalid image URL',
  })
  profileImage: string | null;
}

export interface IUserCreateResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  profileImage: string | null;
  blogEntries: BlogEntry[];
}

import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { BlogEntry } from 'src/blog/model/blog-entry.interface';
import { UserRole } from './user.interface';

export class UserCreateDto {
  @IsString({ message: 'userName: Debe ser un string' })
  @MinLength(3, { message: 'userName: Debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'userName: Debe tener menos de 50 caracteres' })
  @IsNotEmpty({ message: 'userName: Es requerido' })
  userName: string;

  @IsEmail({}, { message: 'Email: Debe ser un email válido' })
  @IsNotEmpty({ message: 'Email: Es requerido' })
  email: string;

  @IsString({ message: 'password: Debe ser un string' })
  @MinLength(8, { message: 'password: Debe tener al menos 8 caracteres' })
  @MaxLength(50, { message: 'password: Debe tener menos de 50 caracteres' })
  @IsNotEmpty({ message: 'Password: Es requerido' })
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
  userName: string;
  email: string;
  role: UserRole;
  profileImage: string | null;
  blogEntries: BlogEntry[];
}

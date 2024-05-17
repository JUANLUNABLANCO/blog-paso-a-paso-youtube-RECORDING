import { IUserBase } from './user.interface';
import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
  Matches,
} from 'class-validator';

export class UserCreateDto {
  @IsString({ message: 'userName: Debe ser un string' })
  @MinLength(3, { message: 'userName: Debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'userName: Debe tener menos de 50 caracteres' })
  userName: string;

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

export class UserUpdateDto {
  @IsOptional()
  @IsString({ message: 'userName: Debe ser un string' })
  @MinLength(3, { message: 'userName: Debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'userName: Debe tener menos de 50 caracteres' })
  userName?: string;

  @IsOptional()
  @IsString({ message: 'Profile Image: Debe ser un string' })
  @Matches(/^https?:\/\/assets\/images\/[\w.-_]+\.(png|jpg)$/, {
    message: 'Invalid image URL',
  })
  profileImage?: string | null;
}

// CHANGED ...
export type UserReadWithEntriesDto = Required<
  Pick<
    IUserBase,
    'id' | 'userName' | 'email' | 'profileImage' | 'role' | 'blogEntries'
  >
>;

// este para cuando necesitas recuperar el author de un blogEntry y no quieres que haya recursión infinita
// NO HACER ESTO
// export type UserReadWhitoutEntriesDto = Omit<
//   IUserBase,
//   'password' | 'blogEntries'
//   >;
export type UserReadWithoutEntriesDto = Required<
  Pick<IUserBase, 'id' | 'userName' | 'email' | 'profileImage' | 'role'>
>;

export type UserDeleteDto = Required<Pick<IUserBase, 'id'>>;

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'El nombre del usuario: 3-50 carcateres',
    example: 'Juan Pérez',
  }) // para swagger
  userName: string;

  @IsEmail({}, { message: 'Email: Debe ser un email válido' })
  @ApiProperty({
    description: 'email: El email del usuario',
    example: 'juanperez@micorreo.com',
  }) // para swagger
  email: string;

  @IsString({ message: 'password: Debe ser un string' })
  @MinLength(8, { message: 'password: Debe tener al menos 8 caracteres' })
  @MaxLength(50, { message: 'password: Debe tener menos de 50 caracteres' })
  @ApiProperty({
    description: 'La contraseña del usuario: al menos 8 caracteres y máximo 50',
    example: '12345678',
  }) // para swagger
  password: string;

  @IsOptional()
  @IsString({ message: 'Profile Image:Debe ser un string' })
  @Matches(/^https?:\/\/assets\/images\/[\w.-_]+\.(png|jpg)$/, {
    message: 'Invalid image URL',
  })
  // @ApiPropertyOptional({
  //   description: 'La imagen de perfil del usuario',
  //   example: 'http://assets/images/user-profile.jpg',
  // }) // para swagger. No lo pongas porque en la creación del usuario no se puede poner, no existe en la creación
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

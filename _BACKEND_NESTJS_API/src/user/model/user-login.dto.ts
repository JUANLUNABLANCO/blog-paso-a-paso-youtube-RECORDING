import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UserLoginDto {
  @IsEmail({}, { message: 'email debe ser válido' })
  @IsNotEmpty({ message: 'email es requerido' })
  email: string;

  @IsString({ message: 'password debe ser un string' })
  @MinLength(3, {
    message: 'password incorrecto debes tener mas de 3 caracteres',
  })
  @MaxLength(50, {
    message: 'password incorrecto debe ser menor de 50 caracteres',
  })
  @IsNotEmpty({ message: 'password es requerida' })
  password: string;
}

export interface IUserLoginResponse {
  access_token: string;
}

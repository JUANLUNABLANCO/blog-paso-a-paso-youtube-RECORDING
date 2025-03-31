import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class UserLoginDto {
  @IsEmail({}, { message: 'email debe ser válido' })
  email: string;

  @IsString({ message: 'password debe ser un string' })
  @MinLength(3, {
    message: 'password incorrecto debes tener mas de 3 caracteres',
  })
  @MaxLength(50, {
    message: 'password incorrecto debe ser menor de 50 caracteres',
  })
  password: string;
}

// TODO cambiar estas interfaces a types
// UserLoginReadDto
export interface IUserLoginResponse {
  access_token: string;
}
// UserLogoutReadDto
export interface IUserLogoutResponse {
  message: string;
}

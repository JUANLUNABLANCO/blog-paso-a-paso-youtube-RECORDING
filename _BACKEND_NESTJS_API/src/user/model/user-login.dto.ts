import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class UserLoginDto {
  @IsEmail({}, { message: 'email incorrecto' })
  email: string;

  @IsString({ message: 'password incorrecto' })
  @MinLength(3, {
    message: 'password incorrecto debes tener mas de 3 caracteres',
  })
  @MaxLength(50, {
    message: 'password incorrecto debe ser menor de 50 caracteres',
  })
  password: string;
}

export interface IUserLoginResponse {
  access_token: string;
}

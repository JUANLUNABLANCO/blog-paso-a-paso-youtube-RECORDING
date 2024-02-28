import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Observable, from } from 'rxjs';
import { IUser } from '../../user/model/user.interface';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  generateJWT(user: IUser): Observable<string> {
    return from(this.jwtService.signAsync({ user }));
  }
  generateInvalidJWT(id: number): Observable<string> {
    // TODO hacer lo que haga falta hacerse para que este usuario no vuelva a usar ese token. Lista negra
    console.log(`#### id: ${id}`);
    return from(jwt.sign({}, 'invalidSecret', { expiresIn: '10m' }));
  }
  hashPassword(password: string): Observable<string> {
    return from<string>(bcrypt.hash(password, 12));
  }

  comparePasswords(
    passwordSended: string,
    passwordHash: string,
  ): Observable<any> {
    const match = bcrypt.compare(passwordSended, passwordHash);
    return from<any | boolean>(match);
  }
  async validateToken(token: string) {
    return this.jwtService.verify(token, {
      secret: this.configService.get('JWT_SECRET'),
    });
  }
}

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Observable, from } from 'rxjs';
import { User } from '../../user/model/user.interface';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  generateJWT(user: User): Observable<string> {
    return from(this.jwtService.signAsync({ user }));
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
}

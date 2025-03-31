import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserService } from 'src/user/service/user.service';
import { IUserBase } from 'src/user/model/user.interface';
import { decode } from 'jsonwebtoken';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class UserIsUserGuard implements CanActivate {
  constructor(private userService: UserService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Authorization token missing!');
    }

    const decodedToken: any = decode(token);
    const userIdFromToken = decodedToken?.user?.id;
    const userIdFromParams = +request.params.id;

    if (!userIdFromToken) {
      throw new UnauthorizedException('Invalid token!');
    }

    if (userIdFromParams && userIdFromToken !== userIdFromParams) {
      throw new UnauthorizedException('Unauthorized: User ID mismatch!');
    }

    return this.userService.findOneById(userIdFromToken).pipe(
      map((userFromDB: IUserBase) => {
        if (!userFromDB) {
          throw new UnauthorizedException('User not found!');
        }
        return true; // El usuario existe, tiene permisos
      }),
      catchError(() => {
        throw new UnauthorizedException('User not found!');
      }),
    );
  }
}

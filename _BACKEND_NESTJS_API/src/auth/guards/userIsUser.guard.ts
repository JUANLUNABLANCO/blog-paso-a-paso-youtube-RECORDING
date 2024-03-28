import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Observable, catchError, map, of } from 'rxjs';
import { UserService } from 'src/user/service/user.service';
import { IUser } from 'src/user/model/user.interface';
import { decode } from 'jsonwebtoken';
import { ErrorHandler } from 'src/core/errors/error.handler';

@Injectable()
export class UserIsUserGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const params = request.params;

    // ID from request
    const user: IUser = request.user ? request.user : null;
    const idFromRequest = user?.id ? user.id : null;

    // console.log('#### User From request: ', user, params);
    // ID from params
    let idFromParams = null;

    // console.log('#### existe params.id' + params.id);
    idFromParams = params?.id ? Number(params.id) : null;

    const token = request.headers.authorization
      ? request.headers.authorization.split(' ')[1]
      : null;

    // ID from token
    let idFromToken = null;

    try {
      if (token) {
        const jwtDecoded = decode(token, { json: true });
        idFromToken = jwtDecoded.user?.id;
      }
    } catch (error) {
      throw ErrorHandler.createSignatureError('Invalid token');
    }
    // id to check
    let idToCheck: number;
    if (
      idFromRequest &&
      idFromParams &&
      idFromParams === idFromToken &&
      idFromParams === idFromRequest
    ) {
      console.log('#### Id from Params exists: ' + idFromParams);
      idToCheck = idFromParams;
    } else if (
      !idFromParams &&
      idFromRequest &&
      idFromToken === idFromRequest
    ) {
      console.log('#### Id from Params not exists: ');
      idToCheck = idFromToken || idFromRequest;
    } else {
      return of(false);
    }
    try {
      return this.userService.findOneById(idToCheck).pipe(
        map((userFromDB: IUser) => {
          let hasPermission = false;
          if (userFromDB) {
            console.log('#### userFromDB: ', userFromDB);
            hasPermission = true;
          }
          return user && hasPermission;
        }),
        catchError((err) => {
          console.log('#### error: usuario no encontrado');
          throw ErrorHandler.handleNotFoundError('User not found');
        }),
      );
    } catch (error) {
      console.log('#### error: BD error');
      throw ErrorHandler.createSignatureError('Error de base de datos');
    }
  }
}

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { UserService } from 'src/user/service/user.service';
import { IUser } from 'src/user/model/user.interface';

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
    const user: IUser = request.user.user;
    // console.log('## user: ', user);

    return this.userService.findOneById(user.id).pipe(
      map((user: IUser) => {
        let hasPermission = false;
        // console.log('## USER IS USER GUARD: ', user.id, params.id);

        if (user.id === Number(params.id)) {
          hasPermission = true;
        }
        return user && hasPermission;
      }),
    );
  }
}

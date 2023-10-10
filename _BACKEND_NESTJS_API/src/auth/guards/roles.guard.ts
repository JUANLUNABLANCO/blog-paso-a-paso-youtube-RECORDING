import {
  Injectable,
  CanActivate,
  Inject,
  forwardRef,
  ExecutionContext,
} from '@nestjs/common';
import { UserService } from 'src/user/service/user.service';
import { Observable, map } from 'rxjs';
import { User } from 'src/user/model/user.interface';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) return true;

    const request = context.switchToHttp().getRequest();
    const user: User = request.user.user;

    return this.userService.findOne(user.id).pipe(
      map((user: User) => {
        const hasRole = () => roles.indexOf(user.role) > -1;
        let hasPermission = false;
        if (hasRole()) {
          hasPermission = true;
        }
        return user && hasPermission;
      }),
    );
  }
}

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/service/user.service';
import { BlogService } from '../service/blog.service';
import { Observable, map, switchMap } from 'rxjs';
import { IUser } from 'src/user/model/user.interface';
import { BlogEntry } from '../model/blog-entry.interface';

@Injectable()
export class UserIsAuthorGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private blogService: BlogService,
  ) {}

  canActivate(context: ExecutionContext): Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const params = request.params;
    const blogEntryId = Number(params.id);
    const user: IUser = request.user;

    return this.userService.findOneById(user.id).pipe(
      switchMap((user: IUser) =>
        this.blogService.findOne(Number(blogEntryId)).pipe(
          map((blogEntry: BlogEntry) => {
            let hasPermission = false;

            if (user.id === blogEntry.author.id) {
              hasPermission = true;
            }

            return user && hasPermission;
          }),
        ),
      ),
    );
  }
}

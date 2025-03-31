import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/service/user.service';
import { BlogEntriesService } from '../service/blog-entries.service';
import { Observable, map, switchMap } from 'rxjs';
import { IUserBase } from 'src/user/model/user.interface';
import { IBlogEntry } from '../model/blog-entry.interface';

@Injectable()
export class UserIsAuthorGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private blogService: BlogEntriesService,
  ) {}

  canActivate(context: ExecutionContext): Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const params = request.params;
    const blogEntryId = Number(params.id);
    const user: IUserBase = request.user;

    return this.userService.findOneById(user.id).pipe(
      switchMap((user: IUserBase) =>
        this.blogService.findOne(Number(blogEntryId)).pipe(
          map((blogEntry: IBlogEntry) => {
            if (!user || !blogEntry) {
              console.log('#### Result: ', blogEntry, user);
              return false;
            }
            let hasPermission = false;

            if (user.id === blogEntry.author.id) {
              console.log('#### User is author');
              hasPermission = true;
            } else {
              console.log('#### User is not author');
            }

            return user && hasPermission;
          }),
        ),
      ),
    );
  }
}

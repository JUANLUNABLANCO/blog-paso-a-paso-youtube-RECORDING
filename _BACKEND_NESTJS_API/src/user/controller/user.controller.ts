import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { Observable, catchError, map, of } from 'rxjs';
import { User, UserRole } from '../model/user.interface';
import { hasRoles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserIsUserGuard } from '../../auth/guards/userIsUser.guard';
import { Pagination } from 'nestjs-typeorm-paginate';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  create(@Body() user: User): Observable<User | { error: any }> {
    return this.userService.create(user).pipe(
      map((user: User) => user),
      catchError((err) => of({ error: err.message })),
    );
  }
  @Post('login')
  login(@Body() user: User): Observable<{ access_token: any }> {
    return this.userService.login(user).pipe(
      map((jwt: string) => {
        return { access_token: jwt };
      }),
    );
  }

  @Get(':id')
  findOne(@Param() params): Observable<User> {
    return this.userService.findOne(params.id);
  }

  @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('email')
  findOneByEmail(@Body() user: User): Observable<User> {
    return this.userService.findOneByEmail(user);
  }

  @Post('exist')
  emailExist(@Body() user: User): Observable<boolean> {
    user.email = user.email.toLowerCase();
    return this.userService.emailExist(user);
  }

  // @hasRoles(UserRole.ADMIN)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Get()
  // findAll(): Observable<User[]> {
  //   return this.userService.findAll();
  // }
  @Get()
  index(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('name') name: string,
  ): Observable<Pagination<User>> {
    limit = limit > 100 ? 100 : limit;

    const route = `${process.env.API_URL}:${process.env.API_PORT}/api/users`;
    // console.log('## route', route);
    if (name === null || name === undefined) {
      return this.userService.paginate({
        page: Number(page),
        limit: Number(limit),
        route: route,
      });
    } else {
      // return this.userService.paginateFilterByName(
      //   {
      //     page: Number(page),
      //     limit: Number(limit),
      //     route: route,
      //   },
      //   { name },
      // );
    }
  }

  @UseGuards(JwtAuthGuard, UserIsUserGuard)
  @Put(':id')
  updateOne(@Param('id') id: string, @Body() user: User): Observable<any> {
    return this.userService.updateOne(Number(id), user);
  }

  @UseGuards(JwtAuthGuard, UserIsUserGuard)
  @Put(':id/password')
  updatePassword(@Param('id') id: string, @Body() user: User): Observable<any> {
    return this.userService.updatePassword(Number(id), user);
  }

  @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id/role')
  updateRoleOfUser(
    @Param('id') id: string,
    @Body() user: User,
  ): Observable<any> {
    const roles = Object.values(UserRole);
    // console.log('## roles keys', roles);
    if (roles.includes(user.role)) {
      return this.userService.updateRoleOfUser(Number(id), user);
    } else {
      return of({ error: `Role '${user.role}' not allowed` });
    }
  }
  @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  deleteOne(@Param('id') id: string): Observable<any> {
    return this.userService.deleteOne(Number(id));
  }
}

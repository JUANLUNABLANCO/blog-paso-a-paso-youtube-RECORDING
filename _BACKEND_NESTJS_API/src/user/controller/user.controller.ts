// external
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
  Request,
  Response,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { Observable, of, from } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Pagination } from 'nestjs-typeorm-paginate';
// mine
import { ConfigService } from '@nestjs/config';
import { User, UserRole, File } from '../model/user.interface';
import { hasRoles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserIsUserGuard } from '../../auth/guards/userIsUser.guard';
// files
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path = require('path');

export const storage = {
  storage: diskStorage({
    destination: './uploads/profileImages',
    filename: (req, file, cb) => {
      const filename: string =
        path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
      const extension: string = path.parse(file.originalname).ext;
      cb(null, `${filename}${extension}`);
    },
  }),
};
@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  @Post()
  create(@Body() user: User): Observable<
    | {
        user: User;
        access_token: string;
      }
    | { error: any }
  > {
    return this.userService.create(user).pipe(
      map(({ user, token }) => {
        return { user: user, access_token: token };
      }),
      // catchError((err) => of({ error: err.message })),
    );
  }
  @Post('login')
  login(@Body() user: User): Observable<{ access_token: any }> {
    console.log('## USER CONTROLLER: IN LOGIN ', user);
    return this.userService.login(user).pipe(
      map((jwt: string) => {
        return { access_token: jwt };
      }),
    );
  }

  // TODO logout

  // TODO user is user or user is Admin
  // @UseGuards(JwtAuthGuard, UserIsUserGuard)
  @Get(':id')
  findOne(@Param() params): Observable<User> {
    return this.userService.findOne(params.id);
  }

  @Post('email')
  findOneByEmail(@Body() user: User): Observable<User> {
    return this.userService.findOneByEmail(user);
  }

  @Post('check-email-exists')
  emailExist(@Body() user: User): Observable<boolean> {
    user.email = user.email.toLowerCase();
    return this.userService.checkEmailExist(user);
  }

  @UseGuards(JwtAuthGuard, UserIsUserGuard)
  @Put(':id')
  updateOne(@Param('id') id: string, @Body() user: User): Observable<any> {
    console.log('### USER: ', user);
    // solo permitimos el cambio de nombre y de email
    delete user.role;
    delete user.password;
    delete user.email;
    return this.userService.updateOne(Number(id), user);
  }

  @UseGuards(JwtAuthGuard, UserIsUserGuard)
  @Put(':id/change-password')
  updatePassword(@Param('id') id: string, @Body() user: User): Observable<any> {
    // TODO condiciones especiales, forgot password?, etc.
    return this.userService.updatePassword(Number(id), user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', storage))
  uploadFile(@UploadedFile() file, @Request() req): Observable<File> {
    const user: User = req.user.user;

    console.log('#### Upload: ', this.configService.get('UPLOAD_IMAGE_URL')); // aquí si funciona
    console.log('#### file name: ', file.filename);

    return this.userService
      .updateOne(user.id, { profileImage: file.filename })
      .pipe(
        tap((user: User) => console.log(user)),
        map((user: User) => ({ profileImage: user.profileImage })),
      );
  }

  @Get('profile-image/:imageName')
  findProfileImage(
    @Param('imageName') imageName,
    @Response() resp,
  ): Observable<unknown> {
    console.log(
      'ruta file',
      path.join(process.cwd(), 'uploads/profileImages', imageName),
    );
    return of(
      resp.sendFile(
        path.join(process.cwd(), 'uploads/profileImages', imageName),
      ),
    );
  }

  // ######################  ADMIN #######################################
  // @hasRoles(UserRole.ADMIN)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Get()
  // findAll(): Observable<User[]> {
  //   return this.userService.findAll();
  // }
  @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
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
      return this.userService.paginateFilterByName(
        {
          page: Number(page),
          limit: Number(limit),
          route: route,
        },
        { name },
      );
    }
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
  // ######################  ADMIN #######################################
}

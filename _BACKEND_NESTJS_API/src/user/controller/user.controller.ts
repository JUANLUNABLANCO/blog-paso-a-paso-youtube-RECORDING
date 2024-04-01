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
  NotFoundException,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
  ForbiddenException,
  UseFilters,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Pagination } from 'nestjs-typeorm-paginate';
// mine
import { ConfigService } from '@nestjs/config';
import { IUser, UserRole, File } from '../model/user.interface';
import { hasRoles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserIsUserGuard } from '../../auth/guards/userIsUser.guard';
// files
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { IUserCreateResponse, UserCreateDto } from '../model/user-create.dto';
import {
  IUserLoginResponse,
  IUserLogoutResponse,
  UserLoginDto,
} from '../model/user-login.dto';
import { AuthService } from 'src/auth/services/auth.service';
import { IUserFindResponse } from '../model/user-find.dto';
import { ErrorHandler } from 'src/core/errors/error.handler';
import { AllExceptionsFilter } from 'src/core/errors/all-exceptions.filter';

export const storage = {
  storage: diskStorage({
    destination: './uploads/profileImages', // this.configService.get('UPLOAD_DESTINATION'),
    filename: (req, file, cb) => {
      // // console.log(
      //   `############## fileName and extension: ${file.originalname}`,
      // );
      const filename: string =
        file.originalname.replace(/\s/g, '').split('.')[0] + uuidv4(); // nombre.de.fichero.ext
      const extension: string = path.extname(file.originalname);
      // // console.log(
      //   `############## fileName and extension: ${filename}${extension}`,
      // );
      cb(null, `${filename}${extension}`);
    },
  }),
};

// @UseFilters(AllExceptionsFilter)
@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post()
  create(@Body() user: UserCreateDto): Observable<
    | {
        user: IUserCreateResponse;
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
  login(@Body() user: UserLoginDto): Observable<IUserLoginResponse> {
    // console.log('## USER CONTROLLER: IN LOGIN ', user);
    return this.userService.login(user).pipe(
      map((jwt: string) => {
        return { access_token: jwt };
      }),
    );
  }
  // @UseGuards(JwtAuthGuard, UserIsUserGuard)
  @Get('logout/:userId')
  logout(@Param('userId') userId: string): Observable<IUserLogoutResponse> {
    // // console.log('#### logout id: ', Number(userId));
    return this.authService.generateInvalidJWT(Number(userId)).pipe(
      map((jwt: string) => {
        // console.log('#### logout invalid jwt: ', jwt);
        return { message: `user with id ${userId} is logout` };
      }),
    );
  }

  // TODO user is user or user is Admin
  @Get(':id')
  findOneById(@Param() params): Observable<IUser> {
    return this.userService.findOneById(params.id);
  }
  // TODO WARNING solo el propio usuario o el admin podrán hacer esta solicitud
  @UseGuards(JwtAuthGuard)
  @Post('email')
  findOneByEmail(@Body() user: IUser): Observable<IUser> {
    return this.userService.findOneByEmail(user);
  }
  // TODO findOneByUserName
  @Post('check-email-exists')
  checkEmailExist(@Body() user: IUser): Observable<boolean> {
    user.email = user.email.toLowerCase();
    return this.userService.checkEmailExists(user);
  }

  @UseGuards(JwtAuthGuard, UserIsUserGuard)
  @Put(':id')
  updateOne(@Param('id') id: string, @Body() user: IUser): Observable<any> {
    // console.log('### USER: ', user);
    // solo permitimos el cambio de nombre y de email
    delete user.role;
    delete user.id; // WARNING este debe de caparse porque sinó podrá actualizar su id
    delete user.password;
    delete user.email;
    return this.userService.updateOne(Number(id), user);
  }

  // @UseGuards(JwtAuthGuard, UserIsUserGuard)
  // @Put(':id/change-password')
  // updatePassword(
  //   @Param('id') id: string,
  //   @Body() user: IUser,
  // ): Observable<any> {
  //   // TODO condiciones especiales, forgot password?, etc.
  //   return this.userService.updatePassword(Number(id), user);
  // }

  @UseGuards(JwtAuthGuard, UserIsUserGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', storage))
  uploadFile(@UploadedFile() file, @Request() req): Observable<IUser> {
    let user: IUser;

    if (req.user) {
      user = req.user as IUser;
    } else {
      // console.log('User is not in request');
      throw ErrorHandler.handleNotFoundError('User is not in request');
    }

    // console.log(`#### req user: ${JSON.stringify(req.user)}`);
    // console.log('#### Upload: ', this.configService.get('UPLOAD_IMAGE_URL'));
    // console.log('#### file name: ', file.filename);
    // console.log('#### file path: ', file.path);
    // console.log('#### file originalname: ', file.originalname);
    // console.log(`#### user id: ${user ? user.id : 'No hay usuario'}`);

    try {
      return this.userService.findOneById(user.id).pipe(
        switchMap((user: IUserFindResponse) => {
          if (!user) {
            throw ErrorHandler.handleNotFoundError('User not found');
          }
          user.profileImage = file.filename;
          return this.userService.updateOne(user.id, user).pipe(
            map((userUpdated: IUser) => {
              // console.log(`#### User Updated: ${JSON.stringify(userUpdated)}`);
              return userUpdated;
            }),
            catchError((err) => {
              // console.log('#### err en uploadFile 2: ', err);
              throw ErrorHandler.createSignatureError(err.message);
            }),
          );
        }),
        catchError((err) => {
          // console.log('#### err en uploadFile 1: ', err);
          throw ErrorHandler.createSignatureError(err.message);
        }),
      );
    } catch (error) {
      // console.error('Error en el acceso a la base de datos:', error);
      throw ErrorHandler.createSignatureError('Error de base de datos');
    }
  }

  @Get('profile-image/:imageName')
  findProfileImage(
    @Param('imageName') imageName,
    @Response() resp,
  ): Observable<unknown> {
    // console.log(
    //   'ruta file',
    //   path.join(process.cwd(), 'uploads/profileImages/', imageName),
    // );
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRole.ADMIN)
  @Get()
  index(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('userName') userName: string,
  ): Observable<Pagination<IUser>> {
    limit = limit > 100 ? 100 : limit;

    const route = `${process.env.API_URL}:${process.env.API_PORT}/api/users`;
    // console.log('## route', route);
    if (userName === null || userName === undefined) {
      return this.userService.paginate({
        page: Number(page),
        limit: Number(limit),
        route: route,
      });
    } else {
      return this.userService.paginateFilterByUserName(
        {
          page: Number(page),
          limit: Number(limit),
          route: route,
        },
        { userName },
      );
    }
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRole.ADMIN)
  @Put(':id/role')
  updateRoleOfUser(
    @Param('id') id: string,
    @Body() user: IUser,
  ): Observable<any> {
    const roles = Object.values(UserRole);
    // console.log('## roles keys', roles);
    if (roles.includes(user.role)) {
      return this.userService.updateRoleOfUser(Number(id), user);
    } else {
      return of({ error: `Role '${user.role}' not allowed` });
    }
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRole.ADMIN)
  @Delete(':id')
  deleteOne(@Param('id') id: string): Observable<any> {
    return this.userService.deleteOne(Number(id));
  }
  // ######################  ADMIN #######################################
}

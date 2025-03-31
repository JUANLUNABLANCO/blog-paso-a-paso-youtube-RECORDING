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
  BadRequestException,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Pagination } from 'nestjs-typeorm-paginate';
// mine
import { ConfigService } from '@nestjs/config';
import { IUserBase, UserRole } from '../model/user.interface';
import { hasRoles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserIsUserGuard } from '../../auth/guards/userIsUser.guard';
// files
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import {
  UserReadWithEntriesDto,
  UserReadWithoutEntriesDto,
  UserCreateDto,
  UserUpdateDto,
} from '../model/user.dto';
import {
  IUserLoginResponse,
  IUserLogoutResponse,
  UserLoginDto,
} from '../model/auth.dto';
import { AuthService } from 'src/auth/services/auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

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
@ApiTags('usuarios')
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear usuario' })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado correctamente',
    type: UserCreateDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() user: UserCreateDto): Observable<
    | {
        user: UserReadWithoutEntriesDto; // whit out blogEntries, no tiene de todas formas

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
      map(() => {
        // console.log('#### logout invalid jwt: ', jwt);
        return { message: `user with id ${userId} is logout` };
      }),
    );
  }

  // TODO user is user or user is Admin
  @UseGuards(JwtAuthGuard, UserIsUserGuard)
  @Get(':id')
  findOneById(@Param() params): Observable<UserReadWithEntriesDto> {
    return this.userService.findOneById(params.id);
  }
  // TODO WARNING solo el propio usuario o el admin podrán hacer esta solicitud
  @UseGuards(JwtAuthGuard)
  @Post('email')
  findOneByEmail(@Body() user: IUserBase): Observable<UserReadWithEntriesDto> {
    return this.userService.findOneByEmail(user);
  }
  // TODO findOneByUserName
  @Post('check-email-exists')
  checkEmailExist(@Body() user: IUserBase): Observable<boolean> {
    user.email = user.email.toLowerCase();
    return this.userService.checkEmailExists(user);
  }

  @UseGuards(JwtAuthGuard, UserIsUserGuard)
  @Put(':id')
  updateOne(
    @Param('id') id: string,
    @Body() user: UserUpdateDto,
  ): Observable<UserReadWithEntriesDto> {
    // console.log('### USER: ', user);
    return this.userService.updateOne(Number(id), user).pipe(
      map((userUpdated: UserReadWithEntriesDto) => {
        console.log(`#### User Updated: ${JSON.stringify(userUpdated)}`);
        return userUpdated;
      }),
    );
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
  uploadFile(
    @UploadedFile() file,
    @Request() req,
  ): Observable<UserReadWithEntriesDto> {
    let user: IUserBase;

    if (req.user) {
      user = req.user as UserReadWithEntriesDto;
    } else {
      // console.log('User is not in request');
      throw new NotFoundException('User is not in request');
    }

    try {
      return this.userService.findOneById(user.id).pipe(
        switchMap((user: UserReadWithEntriesDto) => {
          if (!user) {
            throw new NotFoundException('User not found');
          }
          user.profileImage = file.filename;
          return this.userService.updateOne(user.id, user).pipe(
            map((userUpdated: UserReadWithEntriesDto) => {
              // console.log(`#### User Updated: ${JSON.stringify(userUpdated)}`);
              return userUpdated;
            }),
            catchError((err) => {
              // console.log('#### err en uploadFile 2: ', err);
              throw new BadRequestException(
                'El Usuario no ha podido ser actualizado!',
              );
            }),
          );
        }),
        catchError(() => {
          // console.log('#### err en uploadFile 1: ', err);
          throw new InternalServerErrorException('Error de Base de datos!');
        }),
      );
    } catch (error) {
      // console.error('Error en el acceso a la base de datos:', error);
      throw new InternalServerErrorException('Error de Base de datos!');
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
  ): Observable<Pagination<UserReadWithEntriesDto>> {
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
    @Body() user: IUserBase,
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

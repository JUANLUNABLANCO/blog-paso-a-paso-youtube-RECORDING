import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../model/user.entity';
import { Repository, Like } from 'typeorm';

import { Observable, from, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

import { AuthService } from '../../auth/services/auth.service';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { ErrorHandler } from 'src/core/errors/error.handler';
import { IUser, UserRole } from '../model/user.interface';
import { UserCreateDto, IUserCreateResponse } from '../model/user-create.dto';
import { UserLoginDto } from '../model/user-login.dto';
import { IUserFindResponse } from '../model/user-find.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private authService: AuthService,
  ) {}
  // TODO debe enviar un mensaje de error ususario ya existe
  create(user: UserCreateDto): Observable<{
    user: IUserCreateResponse;
    token: string;
  }> {
    return this.findOneByEmail(user).pipe(
      switchMap((existingUser: IUser) => {
        if (existingUser) {
          // console.log('#### YA EXISTE EL BICHO ####');
          throw new BadRequestException('User already exists');
        } else {
          return this.createUser(user);
        }
      }),
    );
  }
  private createUser(user: UserCreateDto): Observable<{
    user: IUserCreateResponse;
    token: string;
  }> {
    return this.authService
      .hashPassword(user.password)
      .pipe(
        switchMap((passwordHash: string) => this.saveUser(user, passwordHash)),
      );
  }
  private saveUser(
    user: UserCreateDto,
    passwordHash: string,
  ): Observable<{
    user: IUserCreateResponse;
    token: string;
  }> {
    const newUser = new UserEntity();
    newUser.userName = user.userName;
    newUser.email = user.email;
    newUser.password = passwordHash;
    newUser.role = this.getRoleAdminOrUser(user.email);

    return from(this.userRepository.save(newUser)).pipe(
      switchMap((createdUser: IUser) => {
        delete createdUser.password;
        return this.generateToken(createdUser);
      }),
    );
  }
  private generateToken(createdUser: IUser): Observable<{
    user: IUserCreateResponse;
    token: string;
  }> {
    if (!createdUser) {
      throw new BadRequestException('Fallo al intentar crear al Usuario!');
    }
    const { id, userName, email, role, profileImage, blogEntries } =
      createdUser;
    const userResponseDto: IUserCreateResponse = {
      id,
      userName,
      email,
      role,
      profileImage,
      blogEntries,
    };

    return this.authService.generateJWT(createdUser).pipe(
      map((token: string) => ({
        user: userResponseDto,
        token: token,
      })),
    );
  }
  private getRoleAdminOrUser(email: string): UserRole {
    if (process.env.CONTROL === 'local' || process.env.CONTROL === 'test') {
      if (email == process.env.ADMIN_EMAIL) {
        return UserRole.ADMIN;
      }
    } else if (
      process.env.CONTROL === 'dev' ||
      process.env.CONTROL === 'prod'
    ) {
      if (email == 'agileninja.tech@gmail.com') {
        return UserRole.ADMIN;
      }
    }
    return UserRole.USER;
  }
  login(user: UserLoginDto): Observable<string> {
    // console.log('#### User: ', user);
    try {
      return this.validateUser(user.email, user.password).pipe(
        switchMap((user: UserLoginDto) => {
          if (user) {
            return this.authService
              .generateJWT(user)
              .pipe(map((jwt: string) => jwt));
          } else {
            ErrorHandler.handleUnauthorizedError('Wrong Credentials !!'); // ANTES return 'Wrong Credentials';
          }
        }),
      );
    } catch (err) {
      throw new InternalServerErrorException('Fallo de base de Datos!');
    }
  }
  findOneById(id: number): Observable<IUserFindResponse> {
    try {
      // console.log(`#### Aquí llega, findOneById: ${id}`);
      return from(
        this.userRepository.findOne({
          where: { id: id },
          relations: { blogEntries: true },
        }),
      ).pipe(
        map((user: IUser) => {
          if (!user) {
            // WARNING NO BORRAR COMENTARIO
            // COMENTARIO no queremos provocar un error, si no lo encuentra eso que lo decida la función que llama a esta
            return null;
          }
          return this.transformUserToResponse(user);
        }),
        catchError((err) => {
          // console.log('#### err en findOneById 1: ', err);
          throw new InternalServerErrorException('Error en La Base de Datos!');
        }),
      );
    } catch (err) {
      // console.log('#### err en findOneById 2: ', err);
      throw new InternalServerErrorException('Error en La Base de Datos!');
    }
  }
  findOneByEmail(user: IUser): Observable<IUserFindResponse> {
    try {
      return from(
        this.userRepository.findOne({
          where: { email: user.email },
          relations: { blogEntries: true },
        }),
      ).pipe(
        map((user: IUser) => {
          if (!user) {
            // ErrorHandler.handleNotFoundError('User not found'); // WARNING no queremos provocar un error si no lo encuentra eso que lo decida la función que llama a esta
            return null;
          }
          return this.transformUserToResponse(user);
        }),
      );
    } catch (err) {
      // console.log('#### err en findOneByEmail: ', err);
      throw new InternalServerErrorException(err.message);
    }
  }
  findOneByUserName(user: IUser): Observable<IUserFindResponse> {
    try {
      return from(
        this.userRepository.findOne({
          where: { userName: user.userName },
          relations: ['blogEntries'],
        }),
      ).pipe(
        map((user: IUser) => {
          if (!user) {
            // ErrorHandler.handleNotFoundError('User not found'); // WARNING no queremos provocar un error si no lo encuentra eso que lo decida la función que llama a esta
            return null;
          }
          return this.transformUserToResponse(user);
        }),
      );
    } catch (err) {
      throw new InternalServerErrorException('Fallo de base de Datos!');
    }
  }
  private transformUserToResponse(user: IUser): IUserFindResponse {
    // console.log(`#### Transforming user to response...${JSON.stringify(user)}`);
    const { password, ...result } = user;
    return {
      id: result.id,
      userName: result.userName,
      email: result.email,
      role: result.role,
      profileImage: result.profileImage,
      blogEntries: result.blogEntries,
    };
  }
  checkEmailExists(user: IUser): Observable<boolean> {
    try {
      return from(
        this.userRepository
          .findOne({
            where: {
              email: user.email.toLowerCase(),
            },
          })
          .then((resp) => {
            if (resp !== null) {
              return true;
            } else {
              return false;
            }
          }),
      );
    } catch (err) {
      throw new InternalServerErrorException('Fallo de base de Datos!');
    }
  }
  // TODO check-userName-exists
  findAll(): Observable<IUserFindResponse[]> {
    try {
      return from(
        this.userRepository.find({
          relations: { blogEntries: true },
        }),
      ).pipe(
        map((users: IUser[]) => {
          return users.map((user: IUser) => this.transformUserToResponse(user));
        }),
      );
    } catch (err) {
      throw new InternalServerErrorException('Fallo de base de Datos!');
    }
  }
  // TODO add relations : ['blogEntries']
  paginate(options: IPaginationOptions): Observable<Pagination<IUser>> {
    return from(paginate<UserEntity>(this.userRepository, options)).pipe(
      map((usersPageable: Pagination<IUser>) => {
        usersPageable.items.forEach((user) => {
          delete user.password;
        });
        // console.log('## usersPageable in paginate: ', usersPageable);
        return usersPageable;
      }),
    );
  }
  paginateFilterByUserName(
    options: IPaginationOptions,
    user: IUser,
  ): Observable<Pagination<IUser>> {
    // console.log('#### USER: ', user);
    return from(
      this.userRepository.findAndCount({
        skip: (Number(options.page) - 1) * Number(options.limit) || 0,
        take: Number(options.limit) || 10,
        order: { id: 'ASC' },
        select: [
          'id',
          'userName',
          'email',
          'role',
          'profileImage',
          'blogEntries',
        ],
        where: [
          {
            userName: Like(`%${user.userName}%`),
          },
        ],
        relations: { blogEntries: true },
      }),
    ).pipe(
      map(([users, totalUsers]) => {
        // TODO tienes que extraer esas lógicas en pequeñas funciones que lo calculen puesto que estas son algo complejas para tenerlas en una expresión ternaria, que además no siempre funciona
        //
        // console.log('#### USERS: ', users);
        const totalPages = Math.ceil(totalUsers / Number(options.limit));
        const nextPage = Number(options.page) + 1;

        const usersPageable: Pagination<IUser> = {
          items: users,
          links: {
            first: options.route + `?limit=${options.limit}`,
            previous: options.route + '',
            next:
              nextPage <= totalPages
                ? `${options.route}?limit=${options.limit}&page=${nextPage}`
                : `${options.route}?limit=${options.limit}&page=${totalPages}`,
            last: options.route + `?limit=${options.limit}&page=${totalPages}`,
          },
          meta: {
            currentPage: Number(options.page),
            itemCount: users.length,
            itemsPerPage: Number(options.limit),
            totalItems: totalUsers,
            totalPages: Math.ceil(totalUsers / Number(options.limit)),
          },
        };
        // console.log('## usersPageable in FilterByUserName: ', usersPageable);
        return usersPageable;
      }),
    );
  }
  updateOne(id: number, user: IUser): Observable<IUser> {
    // console.log('#### User to update in updateOne(): ', user);
    // No se pueden actualizar desde aquí el email, password, role. Solo username, profileImage and BlogEntries[]
    // delete user.email;
    // delete user.password;
    // delete user.role;
    const { blogEntries, ...userWithoutRelations } = user;

    return from(
      this.userRepository.update(Number(id), userWithoutRelations),
    ).pipe(
      switchMap((resp) => {
        // console.log('#### User Just Updated ####' + JSON.stringify(resp));
        return this.findOneById(id); // of(user); //
      }),
      catchError((err) => {
        // console.log('#### err en updateOne: ', err);
        throw new InternalServerErrorException(err.message);
      }),
    );
  }
  updateRoleOfUser(id: number, user: IUser): Observable<any> {
    delete user.email;
    delete user.password;
    delete user.userName;

    return from(this.userRepository.update(id, user));
  }
  deleteOne(id: number): Observable<any> {
    return from(this.userRepository.delete(id));
  }
  private validateUser(email: string, password: string): Observable<IUser> {
    // console.log('#### PASSWORD: ', password);
    try {
      return from(
        this.findByEmail(email.toLowerCase()).pipe(
          switchMap((user: IUser) => {
            if (!user) {
              ErrorHandler.handleUnauthorizedError('Wrong Credentials !!');
            }
            // console.log('#### User BD: ', user);
            // console.log('#### Passwords: ', password, user.password);
            return this.authService
              .comparePasswords(password, user.password)
              .pipe(
                map((match: boolean) => {
                  if (match) {
                    const { password, ...result } = user;
                    return result;
                  } else {
                    throw new UnauthorizedException('Wrong Credentials!');
                  }
                }),
              );
          }),
        ),
      );
    } catch (err) {
      throw new InternalServerErrorException('Fallo de base de Datos!');
    }
  }
  private findByEmail(email: string): Observable<IUser> {
    try {
      return from(
        this.userRepository
          .findOne({
            select: [
              'id',
              'userName',
              'email',
              'role',
              'profileImage',
              'password',
            ],
            relations: ['blogEntries'],
            where: { email: email },
          })
          .then((user: IUser) => {
            if (!user) {
              // WARNING NO BORRAR EL COMENTARIO
              // COMENTARIO al ser un método privado que se usa en varias partes por ejemplo en el login, en el profile
              // es mejor delegar la respuesta del error al método que lo llama, uno pondrá 'usuario not found' y otro 'wrong credentials'
              // TODO prueba este return null añadido
              return null;
            } else {
              return user;
            }
          }),
      );
    } catch (err) {
      throw new InternalServerErrorException('Fallo de base de Datos!');
    }
  }
}

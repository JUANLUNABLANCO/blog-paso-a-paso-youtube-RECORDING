import {
  HttpCode,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../model/user.entity';
import { Like, Repository } from 'typeorm';
import { IUser, UserRole } from '../model/user.interface';
import { EMPTY, Observable, from, throwError } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { AuthService } from '../../auth/services/auth.service';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { ErrorHandler } from 'src/core/error.handler';
import { IUserCreateResponse, UserCreateDto } from '../model/user-create.dto';
import { UserLoginDto } from '../model/user-login.dto';

// TODO control de errores backend, enviar este tipo throw new NotFoundException('User not found');
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private authService: AuthService,
  ) {}
  create(user: UserCreateDto): Observable<{
    user: IUserCreateResponse;
    token: string;
  }> {
    try {
      // TODO Validaciones asíncronas usuario existe?, campos válidos
      // si usuario no existe lo guardamos en la BD
      return this.authService.hashPassword(user.password).pipe(
        switchMap((passwordHash: string) => {
          if (passwordHash.length === 0) {
            throw new ErrorHandler({
              type: 'BAD_REQUEST',
              message: 'Password not valid, something went wrong',
            });
          }
          const newUser = new UserEntity();
          newUser.name = user.name;
          newUser.email = user.email;
          newUser.password = passwordHash;

          // SOLO para dev/test mode
          if (process.env.CONTROL === 'prod' || process.env.CONTROL === 'dev') {
            newUser.role = UserRole.USER;
          }
          if (
            user.email == 'admin@admin.com' &&
            process.env.NODE_ENV !== 'prod'
          ) {
            newUser.role = UserRole.ADMIN;
            // console.log('#### ADMIN REGISTER ####', newUser);
          }
          // SOLO para dev/test mode

          return from(this.userRepository.save(newUser)).pipe(
            switchMap((createdUser: IUser) => {
              if (!createdUser) {
                throw new ErrorHandler({
                  type: 'BAD_REQUEST',
                  message: 'User not created, something went wrong !!',
                });
              }
              const { password, ...result } = createdUser;
              // convertir un IUser a un IUserCreateResponse TODO refactorizar
              const userResponseDto: IUserCreateResponse = {
                id: result.id!,
                name: result.name!,
                email: result.email!,
                role: result.role!,
                profileImage: result.profileImage,
                blogEntries: result.blogEntries,
              };

              return this.authService.generateJWT(createdUser).pipe(
                map((token: string) => ({
                  user: userResponseDto,
                  token: token,
                })),
                // generate JWT errors
                catchError((err) => {
                  throw new ErrorHandler({
                    type: 'BAD_REQUEST',
                    message: 'Token not created, something went wrong',
                  });
                }),
              );
            }),
          );
        }),
      );
    } catch (err) {
      throw ErrorHandler.createSignatureError(err.message);
    }
  }
  findOne(id: number): Observable<IUser> {
    try {
      return from(this.userRepository.findOneBy({ id })).pipe(
        map((user: IUser) => {
          if (!user) {
            ErrorHandler.handleNotFoundError('User not found');
          } else {
            const { password, ...result } = user;
            return result;
          }
        }),
      );
    } catch (error) {
      // otro tipo de errores no controlados
      throw error;
    }
  }

  findOneByEmail(user: IUser): Observable<IUser> {
    console.log('user:', user);
    return from(
      this.userRepository.findOne({
        select: ['id', 'name', 'email', 'role'],
        where: { email: user.email },
      }),
    );
  }
  checkEmailExist(user: IUser): Observable<boolean> {
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
  }

  findAll(): Observable<IUser[]> {
    return from(this.userRepository.find()).pipe(
      map((users: IUser[]) => {
        users.forEach((user) => {
          delete user.password;
        });
        return users;
      }),
    );
  }
  paginate(options: IPaginationOptions): Observable<Pagination<IUser>> {
    return from(paginate<UserEntity>(this.userRepository, options)).pipe(
      map((usersPageable: Pagination<IUser>) => {
        usersPageable.items.forEach((user) => {
          delete user.password;
        });
        console.log('## usersPageable: ', usersPageable);
        return usersPageable;
      }),
    );
  }

  paginateFilterByName(
    options: IPaginationOptions,
    user: IUser,
  ): Observable<Pagination<IUser>> {
    return from(
      this.userRepository.findAndCount({
        skip: Number(options.page) * Number(options.limit) || 0,
        take: Number(options.limit) || 10,
        order: { id: 'ASC' },
        select: ['id', 'name', 'email', 'role'],
        where: [
          {
            name: Like(`%${user.name}%`),
          },
        ],
      }),
    ).pipe(
      map(([users, totalUsers]) => {
        const usersPageable: Pagination<IUser> = {
          items: users,
          links: {
            first: options.route + `?limit=${options.limit}`,
            previous: options.route + '',
            next:
              options.route +
              `?limit=${options.limit}&page=${Number(options.page) + 1}`,
            last:
              options.route +
              `?limit=${options.limit}&page=${Math.ceil(
                totalUsers / Number(options.page),
              )}`,
          },
          meta: {
            currentPage: Number(options.page),
            itemCount: users.length,
            itemsPerPage: Number(options.limit),
            totalItems: totalUsers,
            totalPages: Math.ceil(totalUsers / Number(options.limit)),
          },
        };
        console.log('## usersPageable in FilterByName: ', usersPageable);
        return usersPageable;
      }),
    );
  }
  updateOne(id: number, user: IUser): Observable<any> {
    // console.log('### User: ', user);
    delete user.id;
    delete user.email;
    delete user.password;
    delete user.role;

    return from(this.userRepository.update(Number(id), user)).pipe(
      switchMap(() => {
        return this.findOne(id);
      }),
    );
  }
  updatePassword(id: number, user: IUser): Observable<any> {
    delete user.id;
    delete user.email;
    delete user.name;
    delete user.role;
    return this.authService.hashPassword(user.password).pipe(
      switchMap((passwordHash: string) => {
        const newUser = new UserEntity();
        newUser.password = passwordHash;

        return from(this.userRepository.update(Number(id), newUser)).pipe(
          switchMap(() => this.findOne(id)),
        );
      }),
    );
  }

  updateRoleOfUser(id: number, user: IUser): Observable<any> {
    delete user.id;
    delete user.email;
    delete user.password;
    delete user.name;

    return from(this.userRepository.update(Number(id), user));
  }

  deleteOne(id: number): Observable<any> {
    return from(this.userRepository.delete(id));
  }

  login(user: UserLoginDto): Observable<string> {
    // console.log('### User: ', user);
    try {
      return this.validateUser(user.email, user.password).pipe(
        switchMap((user: UserLoginDto) => {
          if (user) {
            return this.authService
              .generateJWT(user)
              .pipe(map((jwt: string) => jwt));
          } else {
            // return EMPTY; // la validación y búsqueda se encargan de  enviar el error
            ErrorHandler.handleUnauthorizedError('Wrong Credentials');
          }
        }),
      );
    } catch (err) {
      throw err;
    }
  }
  private validateUser(email: string, password: string): Observable<IUser> {
    return from(
      this.findByEmail(email).pipe(
        switchMap((user: IUser) => {
          return this.authService
            .comparePasswords(password, user.password)
            .pipe(
              map((match: boolean) => {
                if (match) {
                  const { password, ...result } = user;
                  return result;
                } else {
                  throw new UnauthorizedException('Wrong Credentials');
                }
              }),
            );
        }),
      ),
    );
  }
  private findByEmail(email: string): Observable<IUser> {
    return from(
      this.userRepository
        .findOne({
          select: ['id', 'name', 'email', 'role', 'password'],
          where: { email: email.toLowerCase() },
        })
        .then((user: IUser) => {
          if (!user) {
            throw new NotFoundException('User not found');
          } else {
            return user;
          }
        }),
    );
  }
}

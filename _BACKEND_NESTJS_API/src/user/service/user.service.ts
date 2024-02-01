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
import { User, UserRole } from '../model/user.interface';
import { EMPTY, Observable, from, throwError } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { AuthService } from '../../auth/services/auth.service';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { ErrorHandler } from 'src/core/error.handler';

// TODO control de errores backend, enviar este tipo throw new NotFoundException('User not found');
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private authService: AuthService,
  ) {}
  create(user: User): Observable<{
    user: User;
    token: string;
  }> {
    try {
      // TODO Validaciones asíncronas
      // comprobación si usuario ya existe
      const existingUser = this.findOneByEmail(user).toPromise();
      if (existingUser) {
        throw new ErrorHandler({
          type: 'BAD_REQUEST',
          message: 'User already exists',
        });
      }
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
            switchMap((createdUser: User) => {
              console.log('############### created User: ', createdUser);
              // por si acaso la BD falla
              if (!createdUser) {
                throw new ErrorHandler({
                  type: 'BAD_REQUEST',
                  message: 'User not created, something went wrong',
                });
              }
              const { password, ...result } = createdUser;

              return this.authService.generateJWT(createdUser).pipe(
                map((token: string) => ({
                  user: result,
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
            catchError((err) => {
              // throw new ErrorHandler.createSignatureError(err.message);
              throw new ErrorHandler({
                type: 'NOT_ACCEPTABLE',
                message: 'User not created, something went wrong',
              });
            }),
          );
        }),
      );
    } catch (err) {
      throw ErrorHandler.createSignatureError(err.message);
    }
  }
  findOne(id: number): Observable<User> {
    try {
      return from(this.userRepository.findOneBy({ id })).pipe(
        map((user: User) => {
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

  findOneByEmail(user: User): Observable<User> {
    console.log('user:', user);
    return from(
      this.userRepository.findOne({
        select: ['id', 'name', 'email', 'role'],
        where: { email: user.email },
      }),
    );
  }
  checkEmailExist(user: User): Observable<boolean> {
    return from(
      this.userRepository
        .findOne({
          where: {
            email: Like(`%${user.email}%`),
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

  findAll(): Observable<User[]> {
    return from(this.userRepository.find()).pipe(
      map((users: User[]) => {
        users.forEach((user) => {
          delete user.password;
        });
        return users;
      }),
    );
  }
  paginate(options: IPaginationOptions): Observable<Pagination<User>> {
    return from(paginate<User>(this.userRepository, options)).pipe(
      map((usersPageable: Pagination<User>) => {
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
    user: User,
  ): Observable<Pagination<User>> {
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
        const usersPageable: Pagination<User> = {
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
  updateOne(id: number, user: User): Observable<any> {
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
  updatePassword(id: number, user: User): Observable<any> {
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

  updateRoleOfUser(id: number, user: User): Observable<any> {
    delete user.id;
    delete user.email;
    delete user.password;
    delete user.name;

    return from(this.userRepository.update(Number(id), user));
  }

  deleteOne(id: number): Observable<any> {
    return from(this.userRepository.delete(id));
  }

  login(user: User): Observable<string> {
    // console.log('### User: ', user);
    return this.validateUser(user.email, user.password).pipe(
      switchMap((user: User) => {
        if (user) {
          return this.authService
            .generateJWT(user)
            .pipe(map((jwt: string) => jwt));
        } else {
          return EMPTY; // la validación y búsqueda se encargan de  enviar el error
        }
      }),
    );
  }
  private validateUser(email: string, password: string): Observable<User> {
    return from(
      this.findByEmail(email).pipe(
        switchMap((user: User) => {
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
  private findByEmail(email: string): Observable<User> {
    return from(
      this.userRepository
        .findOne({
          select: ['id', 'name', 'email', 'role', 'password'],
          where: { email: email.toLowerCase() },
        })
        .then((user: User) => {
          if (!user) {
            throw new NotFoundException('User not found');
          } else {
            return user;
          }
        }),
    );
  }
}

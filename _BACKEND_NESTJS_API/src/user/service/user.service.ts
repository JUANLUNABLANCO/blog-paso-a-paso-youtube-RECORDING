import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../model/user.entity';
import { Repository, Like } from 'typeorm';

import { Observable, from } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

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
  // create(user: UserCreateDto): Observable<{
  //   user: IUserCreateResponse;
  //   token: string;
  // }> {
  //   try {
  //     return this.findOneByEmail(user).pipe(
  //       switchMap((existingUser: IUser) => {
  //         if (existingUser) {
  //           throw new ErrorHandler({
  //             type: 'BAD_REQUEST',
  //             message: 'User already exists',
  //           });
  //         }
  //         return this.createUser(user);
  //       }),
  //       catchError(() => {
  //         throw new ErrorHandler({
  //           type: 'BAD_REQUEST',
  //           message: 'Failed to create user',
  //         });
  //       }),
  //     );
  //   } catch (err) {
  //     throw err;
  //   }
  // }
  // private createUser(user: UserCreateDto): Observable<{
  //   user: IUserCreateResponse;
  //   token: string;
  // }> {
  //   return this.authService.hashPassword(user.password).pipe(
  //     switchMap((passwordHash: string) => this.saveUser(user, passwordHash)),
  //     catchError(() => {
  //       throw new ErrorHandler({
  //         type: 'BAD_REQUEST',
  //         message: 'Failed to create user',
  //       });
  //     }),
  //   );
  // }
  // private saveUser(
  //   user: UserCreateDto,
  //   passwordHash: string,
  // ): Observable<{
  //   user: IUserCreateResponse;
  //   token: string;
  // }> {
  //   const newUser = new UserEntity();
  //   if (!newUser) {
  //     throw new ErrorHandler({
  //       type: 'BAD_REQUEST',
  //       message: 'Failed to create user',
  //     });
  //   }
  //   newUser.userName = user.userName;
  //   newUser.email = user.email;
  //   newUser.password = passwordHash;

  //   newUser.role = this.getRoleAdminOrUser(user.email);

  //   return from(this.userRepository.save(newUser)).pipe(
  //     switchMap((createdUser: IUser) => this.generateToken(createdUser)),
  //     catchError(() => {
  //       throw new ErrorHandler({
  //         type: 'BAD_REQUEST',
  //         message: 'Failed to create user',
  //       });
  //     }),
  //   );
  // }
  // private generateToken(createdUser: IUser): Observable<{
  //   user: IUserCreateResponse;
  //   token: string;
  // }> {
  //   if (!createdUser) {
  //     throw new ErrorHandler({
  //       type: 'BAD_REQUEST',
  //       message: 'Failed to create user',
  //     });
  //   }
  //   const { password, ...result } = createdUser;
  //   const userResponseDto: IUserCreateResponse = {
  //     id: result.id!,
  //     userName: result.userName!,
  //     email: result.email!,
  //     role: result.role!,
  //     profileImage: result.profileImage!,
  //     blogEntries: result.blogEntries!,
  //   };

  //   return this.authService.generateJWT(createdUser).pipe(
  //     map((token: string) => ({
  //       user: userResponseDto,
  //       token: token,
  //     })),
  //     catchError(() => {
  //       throw new ErrorHandler({
  //         type: 'BAD_REQUEST',
  //         message: 'Failed to create user',
  //       });
  //     }),
  //   );
  // }

  create(user: UserCreateDto): Observable<{
    user: IUserCreateResponse;
    token: string;
  }> {
    return this.findOneByEmail(user).pipe(
      switchMap((existingUser: IUser) => {
        if (existingUser) {
          throw new ErrorHandler({
            type: 'BAD_REQUEST',
            message: 'User already exists',
          });
        }
        return this.createUser(user);
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
      throw new ErrorHandler({
        type: 'BAD_REQUEST',
        message: 'Failed to create user',
      });
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
      if (email == 'admin@admin.com') {
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
    console.log('#### User: ', user);
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
      throw err;
    }
  }

  findOneById(id: number): Observable<IUserFindResponse> {
    try {
      return from(
        this.userRepository.findOne({
          where: { id: id },
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
      throw err;
    }
  }
  findOneByEmail(user: IUser): Observable<IUserFindResponse> {
    try {
      return from(
        this.userRepository.findOne({
          where: { email: user.email },
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
      throw err;
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
      throw err;
    }
  }
  private transformUserToResponse(user: IUser): IUserFindResponse {
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
  checkEmailExist(user: IUser): Observable<boolean> {
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
      throw err;
    }
  }
  // TODO check-userName-exists
  findAll(): Observable<IUserFindResponse[]> {
    try {
      return from(
        this.userRepository.find({
          relations: ['blogEntries'],
        }),
      ).pipe(
        map((users: IUser[]) => {
          return users.map((user: IUser) => this.transformUserToResponse(user));
        }),
      );
    } catch (err) {
      throw err;
    }
  }

  // TODO add relations : ['blogEntries']
  paginate(options: IPaginationOptions): Observable<Pagination<IUser>> {
    return from(paginate<UserEntity>(this.userRepository, options)).pipe(
      map((usersPageable: Pagination<IUser>) => {
        usersPageable.items.forEach((user) => {
          delete user.password;
        });
        console.log('## usersPageable in paginate: ', usersPageable);
        return usersPageable;
      }),
    );
  }

  paginateFilterByUserName(
    options: IPaginationOptions,
    user: IUser,
  ): Observable<Pagination<IUser>> {
    console.log('#### USER: ', user);
    return from(
      this.userRepository.findAndCount({
        skip: (Number(options.page) - 1) * Number(options.limit) || 0,
        take: Number(options.limit) || 10,
        order: { id: 'ASC' },
        select: ['id', 'userName', 'email', 'role'],
        relations: ['blogEntries'],
        where: [
          {
            userName: Like(`%${user.userName}%`),
          },
        ],
      }),
    ).pipe(
      map(([users, totalUsers]) => {
        // TODO tienes que extraer esas lógicas en pequeñas funciones que lo calculen puesto que estas son algo complejas para tenerlas en una expresión ternaria, que además no siempre funciona
        //
        console.log('#### USERS: ', users);
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
        console.log('## usersPageable in FilterByUserName: ', usersPageable);
        return usersPageable;
      }),
    );
  }

  updateOne(id: number, user: IUser): Observable<any> {
    delete user.email;
    delete user.password;
    delete user.role;

    return from(this.userRepository.update(Number(id), user)).pipe(
      switchMap(() => this.findOneById(id)),
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
    console.log('#### PASSWORD: ', password);
    try {
      return from(
        this.findByEmail(email.toLowerCase()).pipe(
          switchMap((user: IUser) => {
            if (!user) {
              ErrorHandler.handleUnauthorizedError('Wrong Credentials !!');
            }
            console.log('#### User BD: ', user);
            console.log('#### Passwords: ', password, user.password);
            return this.authService
              .comparePasswords(password, user.password)
              .pipe(
                map((match: boolean) => {
                  if (match) {
                    const { password, ...result } = user;
                    return result;
                  } else {
                    // ANTES throw new UnauthorizedException('Wrong Credentials !!');
                    ErrorHandler.handleUnauthorizedError(
                      'Wrong Credentials !!',
                    );
                  }
                }),
              );
          }),
        ),
      );
    } catch (err) {
      throw err;
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
              // WARNING al ser un método privado que se usa en varias partes por ejemplo en el login, en el profile
              // es mejor delegar la respuesta del error al método que lo llama, uno pondrá 'usuario not found' y otro 'wrong credentials'
              // throw new NotFoundException('User not found !!');
            } else {
              return user;
            }
          }),
      );
    } catch (err) {
      throw err;
    }
  }
}

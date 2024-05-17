import {
  BadRequestException,
  HttpStatus,
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
import { IUserBase, UserRole } from '../model/user.interface';
import {
  UserCreateDto,
  UserReadWithEntriesDto,
  UserReadWithoutEntriesDto,
} from '../model/user.dto';
import { UserLoginDto } from '../model/auth.dto';
import { UserAdapter } from '../model/user.adapter';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private authService: AuthService,
  ) {}
  // TODO debe enviar un mensaje de error ususario ya existe
  create(user: UserCreateDto): Observable<{
    user: UserReadWithoutEntriesDto;
    token: string;
  }> {
    return this.findOneByEmail(user).pipe(
      switchMap((existingUser: UserReadWithoutEntriesDto) => {
        if (existingUser) {
          // console.log('#### YA EXISTE EL BICHO ####');
          throw new BadRequestException('User already exists');
        } else {
          return this.createUser(user).pipe(
            switchMap(({ user: createdUser, token }) => {
              console.log('#### CREATED USER ####', createdUser);
              const adaptedUser =
                UserAdapter.adaptToUserReadWithoutEntriesDto(createdUser);
              return of({ user: adaptedUser, token });
            }),
          );
        }
      }),
      catchError((err) => {
        console.log('#### ERROR ####', err);
        throw new InternalServerErrorException(err);
      }),
    );
  }
  private createUser(user: UserCreateDto): Observable<{
    user: UserReadWithoutEntriesDto;
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
    user: UserReadWithoutEntriesDto;
    token: string;
  }> {
    const newUser = new UserEntity();
    newUser.userName = user.userName;
    newUser.email = user.email;
    newUser.password = passwordHash;
    newUser.role = this.getRoleAdminOrUser(user.email);

    try {
      return from(this.userRepository.save(newUser)).pipe(
        switchMap((createdUser: IUserBase) => {
          delete createdUser.password;
          return this.generateToken(createdUser as UserReadWithoutEntriesDto);
        }),
      );
    } catch (error) {
      throw new InternalServerErrorException('Error de Base de datos!');
    }
  }
  private generateToken(createdUser: UserReadWithoutEntriesDto): Observable<{
    user: UserReadWithoutEntriesDto;
    token: string;
  }> {
    if (!createdUser) {
      throw new BadRequestException('Failed to create user!');
    }

    console.log('####### CREATED USER: ', createdUser);

    return this.authService.generateJWT(createdUser).pipe(
      map((token: string) => ({
        user: createdUser,
        token: token,
      })),
      catchError(() => {
        // console.log('#### err en generateToken: ', err);
        throw new InternalServerErrorException('No se pudo crear el token!');
      }),
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
    try {
      return this.validateUser(user.email, user.password).pipe(
        switchMap((user: UserLoginDto) => {
          if (user) {
            // Obtener el usuario sin sus blogEntries
            return this.findOneByEmailWihtoutEntries(user).pipe(
              switchMap((userWithoutEntries: UserReadWithoutEntriesDto) => {
                // Generar el JWT con el usuario obtenido
                return this.authService.generateJWT(userWithoutEntries).pipe(
                  map((jwt: string) => jwt),
                  catchError(() => {
                    // Manejo de errores del JWT aquí
                    throw new UnauthorizedException('Jwt failed!');
                  }),
                );
              }),
              catchError(() => {
                // Manejo de errores de obtención de usuario aquí
                throw new UnauthorizedException('User not found!');
              }),
            );
          } else {
            // Manejo de credenciales incorrectas
            throw new UnauthorizedException('Wrong Credentials!!');
          }
        }),
        catchError((error) => {
          // Manejo de errores de validación de usuario aquí
          throw new InternalServerErrorException('Database Failure!');
        }),
      );
    } catch (err) {
      // Manejo de errores generales aquí
      throw new InternalServerErrorException('Database Failure!');
    }
  }
  findOneById(id: number): Observable<UserReadWithEntriesDto> {
    try {
      // console.log(`#### Aquí llega, findOneById: ${id}`);
      return from(
        this.userRepository.findOne({
          where: { id: id },
          relations: { blogEntries: true },
        }),
      ).pipe(
        map((userFromDB: IUserBase) => {
          return UserAdapter.adaptToUserReadWithEntriesDto(userFromDB);
        }),
      );
    } catch (err) {
      throw new InternalServerErrorException('Error en La Base de Datos!');
    }
  }
  findOneByEmail(user: IUserBase): Observable<UserReadWithEntriesDto | null> {
    try {
      return from(
        this.userRepository.findOne({
          where: { email: user.email },
          relations: { blogEntries: true },
        }),
      ).pipe(
        map((userFromDB: UserReadWithEntriesDto | undefined) => {
          if (!userFromDB) {
            return null; // Si no se encuentra el usuario, emite null
          }
          return UserAdapter.adaptToUserReadWithEntriesDto(userFromDB); // sin pasword
        }),
      );
    } catch (err) {
      console.log('#### err en findOneByEmail: ', err);
      throw new InternalServerErrorException(err.message);
    }
  }
  findOneByEmailWihtoutEntries(
    user: IUserBase,
  ): Observable<UserReadWithoutEntriesDto> {
    try {
      return from(
        this.userRepository.findOne({
          where: { email: user.email },
          relations: { blogEntries: false },
        }),
      ).pipe(
        map((userFinded: IUserBase) => {
          return UserAdapter.adaptToUserReadWithoutEntriesDto(userFinded); // sin pasword
        }),
      );
    } catch (err) {
      // console.log('#### err en findOneByEmail: ', err);
      throw new InternalServerErrorException(err.message);
    }
  }
  findOneByUserName(user: IUserBase): Observable<UserReadWithEntriesDto> {
    try {
      return from(
        this.userRepository.findOne({
          where: { userName: user.userName },
          relations: ['blogEntries'],
        }),
      ).pipe(
        map((userFinded: IUserBase) => {
          return UserAdapter.adaptToUserReadWithEntriesDto(userFinded); // sin pasword
        }),
      );
    } catch (err) {
      throw new InternalServerErrorException('Error en La Base de Datos!');
    }
  }
  // TODO YOU NEED THAT ????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
  // TODO check-userName-exists
  checkEmailExists(user: IUserBase): Observable<boolean> {
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
      throw new InternalServerErrorException('Error en La Base de Datos!');
    }
  }
  // TODO check-userName-exists
  // findAll(): Observable<UserReadWithEntriesDto[]> {
  //   try {
  //     return from(
  //       this.userRepository.find({
  //         relations: { blogEntries: true },
  //       }),
  //     ).pipe(
  //       map((users: IUserBase[]) => {
  //         return users.map((userFinded: IUserBase) => {
  //           return UserAdapter.adaptToUserReadWithEntriesDto(userFinded);
  //         });
  //       }),
  //     );
  //   } catch (err) {
  //     throw new InternalServerErrorException('Error en La Base de Datos!');
  //   }
  // }
  // TODO add relations : ['blogEntries']
  paginate(
    options: IPaginationOptions,
  ): Observable<Pagination<UserReadWithEntriesDto>> {
    return from(
      paginate<UserReadWithEntriesDto>(this.userRepository, options, {
        relations: ['blogEntries'],
      }),
    );
  }
  paginateFilterByUserName(
    options: IPaginationOptions,
    user: IUserBase,
  ): Observable<Pagination<UserReadWithEntriesDto>> {
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

        const usersPageable: Pagination<UserReadWithEntriesDto> = {
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
      catchError(() => {
        // console.log('#### err en paginateFilterByUserName: ', err);
        throw new InternalServerErrorException('Error en la Paginación!');
      }),
    );
  }
  updateOne(id: number, user: IUserBase): Observable<UserReadWithEntriesDto> {
    const { blogEntries, ...userWithoutRelations } = user; // necesario para que no se actualice la relación
    try {
      return from(
        this.userRepository.update(Number(id), userWithoutRelations),
      ).pipe(
        switchMap(() => {
          // console.log('#### User Just Updated ####' + JSON.stringify(resp));
          return this.findOneById(id).pipe(
            map((userUpdated: IUserBase) => {
              return UserAdapter.adaptToUserReadWithEntriesDto(userUpdated); // sin pasword
            }),
          ); // of(user); //
        }),
        catchError(() => {
          // console.log('#### err en updateOne: ', err);
          throw new InternalServerErrorException(
            'Error el usuario no ha podido ser actualizado!',
          );
        }),
      );
    } catch (error) {
      throw new InternalServerErrorException('Error en La Base de Datos!');
    }
  }
  updateRoleOfUser(
    id: number,
    user: IUserBase,
  ): Observable<UserReadWithEntriesDto> {
    delete user.email;
    delete user.password;
    delete user.userName;

    return from(this.userRepository.update(id, user)).pipe(
      switchMap((resultado: any) => {
        if (resultado.affected === 0) {
          throw new InternalServerErrorException(
            'Error al actualizar el rol del usuario',
          );
        } else {
          return this.findOneById(id);
        }
      }),
    );
    // TODO deberías enviar el usuario actualizado, no las filas afectadas
  }
  deleteOne(id: number): Observable<any> {
    console.log('## id', id);
    return from(this.userRepository.delete(id)).pipe(
      map((resultado) => {
        if (resultado.affected === 0) {
          throw new InternalServerErrorException('Error al borrar el usuario');
        } else {
          return {
            message: `Usuario con id ${id} eliminado correctamente`,
            status: HttpStatus.OK,
          };
        }
      }),
      catchError((err) => {
        console.log('#### err en deleteOne: ', err);
        throw new InternalServerErrorException(
          `Error al eliminar el usuario, Un usuario no puede ser eliminado si tiene entradas de blog asociadas. 
          Borra primero sus entradas.`,
        );
      }),
    );
  }
  private validateUser(email: string, password: string): Observable<IUserBase> {
    // console.log('#### EMAIL PASSWORD: ', email, password);
    try {
      return from(
        this.findByEmail(email.toLowerCase()).pipe(
          switchMap((user: IUserBase) => {
            if (!user) {
              throw new UnauthorizedException('Wrong Credentials!');
            }
            // console.log('#### User BD: ', user);
            // console.log('#### Passwords: ', password, user.password);
            try {
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
            } catch (error) {
              throw new InternalServerErrorException(
                'Error en la Autenticación!',
              );
            }
          }),
        ),
      );
    } catch (err) {
      throw new InternalServerErrorException('Error de Base de datos!');
    }
  }
  private findByEmail(email: string): Observable<IUserBase> {
    return from(
      this.userRepository.findOne({
        select: ['id', 'userName', 'email', 'role', 'profileImage', 'password'],
        relations: ['blogEntries'],
        where: { email: email },
      }),
    ).pipe(
      map((user: IUserBase) => {
        if (!user) {
          // WARNING NO BORRAR EL COMENTARIO
          // COMENTARIO al ser un método privado que se usa en varias partes por ejemplo en el login, en el profile
          // es mejor delegar la respuesta del error al método que lo llama, uno pondrá 'usuario not found' y otro 'wrong credentials'
          // TODO prueba este return null añadido
          return null;
        }
        return user;
      }),
      catchError((err) => {
        throw new InternalServerErrorException('Fallo de base de Datos!');
      }),
    );
  }
}

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

import { Observable, from } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

import { AuthService } from '../../auth/services/auth.service';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { ErrorHandler } from 'src/core/errors/error.handler';
import { IUserBase, UserRole } from '../model/user.interface';
import {
  UserCreateDto,
  UserReadWhithEntriesDto,
  UserReadWhithoutEntriesDto,
} from '../model/user.dto';
import { UserLoginDto } from '../model/auth.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private authService: AuthService,
  ) {}
  // TODO debe enviar un mensaje de error ususario ya existe
  create(user: UserCreateDto): Observable<{
    user: UserReadWhithoutEntriesDto;
    token: string;
  }> {
    return this.findOneByEmail(user).pipe(
      switchMap((existingUser: UserReadWhithoutEntriesDto) => {
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
    user: UserReadWhithoutEntriesDto;
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
    user: UserReadWhithoutEntriesDto;
    token: string;
  }> {
    const newUser = new UserEntity();
    newUser.userName = user.userName;
    newUser.email = user.email;
    newUser.password = passwordHash;
    newUser.role = this.getRoleAdminOrUser(user.email);

    return from(this.userRepository.save(newUser)).pipe(
      switchMap((createdUser: UserReadWhithoutEntriesDto) => {
        // delete createdUser.password;
        return this.generateToken(createdUser as UserReadWhithoutEntriesDto);
      }),
    );
  }
  private generateToken(createdUser: UserReadWhithoutEntriesDto): Observable<{
    user: UserReadWhithoutEntriesDto;
    token: string;
  }> {
    if (!createdUser) {
      throw new BadRequestException('Fallo al intentar crear al Usuario!');
    }
    // const { id, userName, email, role, profileImage, blogEntries } =
    //   createdUser;
    // const userResponseDto: UserReadWhithEntriesDto = {
    //   id,
    //   userName,
    //   email,
    //   role,
    //   profileImage,
    //   blogEntries,
    // };

    return this.authService.generateJWT(createdUser).pipe(
      map((token: string) => ({
        user: createdUser,
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
  // login(user: UserLoginDto): Observable<string> {
  //   // console.log('#### User: ', user);
  //   try {
  //     return this.validateUser(user.email, user.password).pipe(
  //       switchMap((user: UserLoginDto) => {
  //         if (user) {
  //           return this.authService
  //             .generateJWT(user)
  //             .pipe(map((jwt: string) => jwt));
  //         } else {
  //           ErrorHandler.handleUnauthorizedError('Wrong Credentials !!'); // ANTES return 'Wrong Credentials';
  //         }
  //       }),
  //     );
  //   } catch (err) {
  //     throw new InternalServerErrorException('Fallo de base de Datos!');
  //   }
  // }
  login(user: UserLoginDto): Observable<string> {
    try {
      return this.validateUser(user.email, user.password).pipe(
        switchMap((user: UserLoginDto) => {
          if (user) {
            // Obtener el usuario sin sus blogEntries
            return this.findOneByEmailWihtoutEntries(user).pipe(
              switchMap((userWithoutEntries: UserReadWhithoutEntriesDto) => {
                // Generar el JWT con el usuario obtenido
                return this.authService.generateJWT(userWithoutEntries).pipe(
                  map((jwt: string) => jwt),
                  catchError((error) => {
                    // Manejo de errores del JWT aquí
                    throw new UnauthorizedException('Jwt failed!');
                  }),
                );
              }),
              catchError((error) => {
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
  findOneById(id: number): Observable<UserReadWhithEntriesDto> {
    try {
      // console.log(`#### Aquí llega, findOneById: ${id}`);
      return from(
        this.userRepository.findOne({
          where: { id: id },
          relations: { blogEntries: true },
          select: [
            'id',
            'userName',
            'email',
            'role',
            'blogEntries',
            'profileImage',
          ],
        }),
      );
    } catch (err) {
      // console.log('#### err en findOneById 2: ', err);
      throw new InternalServerErrorException('Error en La Base de Datos!');
    }
  }
  findOneByEmail(user: IUserBase): Observable<UserReadWhithEntriesDto> {
    try {
      return from(
        this.userRepository.findOne({
          where: { email: user.email },
          relations: { blogEntries: true },
        }),
      );
    } catch (err) {
      // console.log('#### err en findOneByEmail: ', err);
      throw new InternalServerErrorException(err.message);
    }
  }
  findOneByEmailWihtoutEntries(
    user: IUserBase,
  ): Observable<UserReadWhithoutEntriesDto> {
    try {
      return from(
        this.userRepository.findOne({
          where: { email: user.email },
          relations: { blogEntries: false },
        }),
      );
    } catch (err) {
      // console.log('#### err en findOneByEmail: ', err);
      throw new InternalServerErrorException(err.message);
    }
  }
  findOneByUserName(user: IUserBase): Observable<UserReadWhithEntriesDto> {
    try {
      return from(
        this.userRepository.findOne({
          where: { userName: user.userName },
          relations: ['blogEntries'],
        }),
      );
    } catch (err) {
      throw new InternalServerErrorException('Fallo de base de Datos!');
    }
  }
  // TODO refactoriza este ya no es necesario
  // private transformUserToResponse(user: IUserBase): UserReadWhithEntriesDto {
  //   // console.log(`#### Transforming user to response...${JSON.stringify(user)}`);
  //   const { password, ...result } = user;
  //   return {
  //     id: result.id,
  //     userName: result.userName,
  //     email: result.email,
  //     role: result.role,
  //     profileImage: result.profileImage,
  //     blogEntries: result.blogEntries,
  //   };
  // }
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
      throw new InternalServerErrorException('Fallo de base de Datos!');
    }
  }
  // TODO check-userName-exists
  findAll(): Observable<UserReadWhithEntriesDto[]> {
    try {
      return from(
        this.userRepository.find({
          relations: { blogEntries: true },
          // TODO select ???
        }),
      ).pipe(
        map((resultado) => {
          console.log('#### RESULTADO: ', resultado);
          return resultado;
        }),
      );
    } catch (err) {
      throw new InternalServerErrorException('Fallo de base de Datos!');
    }
  }
  // TODO add relations : ['blogEntries']
  paginate(
    options: IPaginationOptions,
  ): Observable<Pagination<UserReadWhithEntriesDto>> {
    console.log('#### paginate');
    return from(
      // CHANGED hemos añadido el relations, pues ahora es diferente
      paginate<UserReadWhithEntriesDto>(this.userRepository, options, {
        relations: ['blogEntries'],
      }),
    ).pipe(
      map((resultado) => {
        console.log('#### RESULTADO: ', resultado);
        return resultado;
      }),
    );
  }
  paginateFilterByUserName(
    options: IPaginationOptions,
    user: IUserBase,
  ): Observable<Pagination<UserReadWhithEntriesDto>> {
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

        const usersPageable: Pagination<UserReadWhithEntriesDto> = {
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
  updateOne(id: number, user: IUserBase): Observable<UserReadWhithEntriesDto> {
    // console.log('#### User to update in updateOne(): ', user);
    // No se pueden actualizar desde aquí el email, password, role. Solo username, profileImage and BlogEntries[]
    // delete user.email;
    // delete user.password;
    // delete user.role;
    const { blogEntries, ...userWithoutRelations } = user;

    return from(
      this.userRepository.update(Number(id), userWithoutRelations),
    ).pipe(
      switchMap(() => {
        // console.log('#### User Just Updated ####' + JSON.stringify(resp));
        return this.findOneById(id); // of(user); //
      }),
      catchError((err) => {
        // console.log('#### err en updateOne: ', err);
        throw new InternalServerErrorException(err.message);
      }),
    );
  }

  // TODO por seguridad este IUserBase solo debe traer el role, puedes crear un dto
  updateRoleOfUser(
    id: number,
    user: IUserBase,
  ): Observable<UserReadWhithEntriesDto> {
    delete user.email;
    delete user.password;
    delete user.userName;

    // return from(this.userRepository.update(id, user));
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
  }
  deleteOne(id: number): Observable<any> {
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
        throw new InternalServerErrorException(`Error al eliminar el usuario, Un usuario no puede ser eliminado si tiene entradas de blog asociadas.
          Borra primero sus entradas.`);
      }),
    );
  }
  private validateUser(email: string, password: string): Observable<IUserBase> {
    // console.log('#### PASSWORD: ', password);
    try {
      return from(
        this.findByEmail(email.toLowerCase()).pipe(
          switchMap((user: IUserBase) => {
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
  private findByEmail(email: string): Observable<IUserBase> {
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
          .then((user: IUserBase) => {
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

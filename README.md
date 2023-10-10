## Getting started

To make it easy for you to get started with GitLab, here's a list of recommended next steps.

Already a pro? Just edit this README.md and make it your own. Want to make it easy? 

[Use the template at the bottom](#editing-this-readme)!

## Add your files

- [ ] [Create](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#create-a-file) or [upload](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#upload-a-file) files
- [ ] [Add files using the command line](https://docs.gitlab.com/ee/gitlab-basics/add-file.html#add-a-file-using-the-command-line) or push an existing Git repository with the following command:

```
cd existing_repo
git remote add origin https://gitlab.com/team015485926/Status-Code-666.git
git branch -M main
git push -uf origin main
```

## npm update

```
 npm i -g  npm@9.7.2
```

## Nest installation

```
 npm install -g @nestjs/cli
```

## Comprobación de versiones

```
npm --version  // v9.7.2
node --version // v16.17.0
nest --version // v10.0.5
```

## Crear un nuevo proyecto conn Nestjs

```
nest new api  // borrar dentro de api/ el .git
```


## Task 01: (vídeo-01) setup api blog with NestJs
Add your own Database string in the .env file. You can use free database from www.elephantsql.com

### Uso de git flow

```
git flow init
git branch develop
git checkout develop
git -m checkout feature/task-02
```


.... coding here until finish task-02

```
git add .
git commit -m ".... message"
git push --set-upstream origin feature/task-02
git flow feature finish
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

### Configuration dotenv

> npm i --save @nestjs/config

crea la carpeta ./config y los ficheros .env.dev y .env.test con las variables de configuracion necesarias

y en app-module debes añadir esta configuración

```typescript
ConfigModule.forRoot({
      envFilePath: `./config/.env.${process.env.NODE_ENV}`,
      isGlobal: true,
    }),
```

### typeorm installation

> npm install --save @nestjs/typeorm typeorm <you prefer>  // mysql | pg | mongodb | ...

añade esto otro

```typescript
TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
    }),
```

ve al package.json y añade los siguientes scripts

```json
    "nest": "nest start --watch",
    "nest:dev": "set NODE_ENV=dev&& npm run nest",
    "nest:test": "set NODE_ENV=test&& npm run nest",
    "nest:prod": "set NODE_ENV=prod&& node dist/main",  
```
### Probemos
prueba la api

```bash
npm run nest:dev
```

### docker-compose nuestra base de datos
crea el docker compose archivo de configuración de docker.
Debes tener docker desktop instalado en w10

```yml
# BACKEND CONFIGURATION NODE_ENV= test | dev | prod
version: '2'
services:
  postgres:
    image: 'postgres:latest'
    restart: always
    volumes:
      - './${VOLUME_FOLDER}:/var/lib/postgresql/data'
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    ports:
      - ${PORT}:${PORT}
```
ahora los scripts

```json
    "docker:db:dev": "docker compose --env-file ./config/.env.dev up",
    "docker:db:test": "rimraf ./postgres_data_test && docker compose --env-file ./config/.env.test up",
```

No olvides crear las variables de entorno en los ficheros correspondientes .dev y .test

```yml
# .env.dev
# Control
CONTROL='dev'

# docker postgres
VOLUME_FOLDER=postgres_data_dev
POSTGRES_USER=postgres_dev
POSTGRES_PASSWORD=dev123
POSTGRES_DB=blogDev
PORT=5432

# API
DATABASE_URL='postgres://postgres_dev:dev123@localhost:5432/blogDev'

API_URL='http://localhost'
API_PORT=3000
```
```yml
# Control
CONTROL='test'

# docker postgres
VOLUME_FOLDER=postgres_data_test
POSTGRES_USER=postgres_test
POSTGRES_PASSWORD=test123
POSTGRES_DB=blogTest
PORT=5432

# API
DATABASE_URL='postgres://postgres_test:test123@localhost:5432/blogTest'

API_URL='http://localhost'
API_PORT=3000
```

Observa que hay dos bases de datos una para test y otra para dev
La primera se borrará al inicio, gracias la script 

### probemos
Vamos a probar todo...

```bash
npm run docker:db:dev
```

```bash
npm run nest:dev
```

¡¡Todo funciona correctamente!!

### git flow
```bash
git status
git add .
git commit -m "task01 finish"

git push
git push --set-stream origin feature/task-01

git flow feature finish
```

## Task 02: CRUD de usuario 

### specifications

Como líder o jefe técnico quisiera tener un CRUD básico para la entidad usuario

#### Acceptance  Criteria:
1. Usar typeorm y el repositorio desde este
2. Usar observables en vez de promesas
3. feature Module "user"
4. user should have properties
  — name
  — email (unique)
  — id (primary key)
5.  Use git flow


## TASK 03: Module auth with JWT authentication (login)

**specifictaions**

As a  User I want to be able to authenticate myself so I can perform (later protected) requests.

**Acceptance criteria:**
New Endpoint: POST '/login', check password in method —- DOING
Expand User Model with password —- DOING
Expand create Endpoint —- DOING
Store 'email' always in lowercase in database —- DOING
Store 'password' always as hashed value in database —- DOING
Add an Auth Module for this —- DOING

### Task 03: (vídeo-03 parte 1+2) Expand user api with login, JWT-validation and Basic Role Auth - Content

```
git checkout develop
git flow feature start task-03
```
```
cd ./api
nest generate module auth
```

Esto genera un módulo a la misma altura que el módulo del usuario.

![auth-module-structure](./documentation/screenshots/Screenshot_01_auth-module.png)

También actualiza el app.module.ts, incluyendo el nuevo módulo

![app-module-updated](./documentation/screenshots/Screenshot_02_app-module-updated.png)

Actualizamos el .env con:
DATABASE_URL, API_PORT, JWT_SECRET

Instalamos jwt para nest con

```
npm install @nestjs/jwt  --save
```

y lo añadimos en auth.module

A continuación crearemos el servicio de auth

```
nest generate service auth/auth
```

Renombra la carpeta generada dentro de auth: auth/auth por auth/services

Necesitamos bcrypt, para encriptar el password

```
npm install bcrypt --save
```

Observa los cambios en uth.module y en auth.service

Ahora vamos con el user.module, vamos a importar lo necesario para usar ese authModule

Cambiemos también el user.interface y el entity añadiendo el password, y la condición de email siempre en minusculas

Cambiaremos el user.service, para incluir aquí el authService

Después debemos modificar el user.controller, para que pueda recibir un mensaje de error en el create() y hacer el 'login'


### Important things

1. Al cambiar la estructura de la base de datos, añadiendo nuevas columnas aparece un error porque existen registro que no tienen esa estructura eso se soluciona de una delas siguientes formas:

  1.1. Se borra la base de datos y comenzamos de nuevo, recuerda cambiar la url de la base de datos en .env
  1.2. o se añade a las columnas nuevas esto otro:

  ```typescript
  @Column({ nullable: true })
  password: string;
  ```

2. La configuración de la base de datos en app.module.ts, debe quedar así:
    ```typescript
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
    }),
    ```

3. En versiones modernas de typescript no se admite esto:
    ```typescript
    create(@Body() user: User): Observable<User | Object> {
    ```
    en cambio esto otro es mejor ...

    ```typescript
    create(@Body() user: User): Observable<User | { error: any }> {
    ```

4. La importaciones deben tener url´s relativas y no absolutas, porque el ./dist no las encuentra

    ```
    import { User } from 'src/user/user.interface.ts';
    ```
    eso sería incorrecto

    ```
    import { User } from '../../user/user.interface.ts';
    ```
    mejor así.


Como vemos en la imagen, al solicitar todos los usuarios el password ha sido omitido, gracias a nuestros pipes(map())

![Data sin password](./documentation/screenshots/Screenshot_03_data-whitout-password.png)

También si hacemos login desde postman con usuario y password válidos recibimos el jwt, que podemos analizar y extraer su info en jwt.io

![JWTio correct token](./documentation/screenshots/Screenshot_04_jwt-correct.png)

Recuerda para ver si la signature is ok debes colocar tu JWT_SECRET del archivo .env en el recuadro de abajo a la derecha y te mostrará Signature Verified



### prettier configuration

1. Teníamos un problema con los finales de línea, nosotros usamos CRLF en VSC, pero el prettier nos marcaba un error en cada final de línea:

```bash
Delete `␍`eslintprettier/prettier
```

Este error es muy molesto, para ello hay varias formas de solucionarlo, directamente en el archivo de configuración de prettier '.prettierrc' o en el '.eslintrc.js', he optado por este último y en la parte de rules: he colocado lo siguiente:

```
rules: {
    ...
    "prettier/prettier": ["error",{
      "endOfLine": "auto"}
    ]
  },
```

![config prettier](./documentation/screenshots/Screenshot_05_config-prettier.png)

solucionado


2. Hay otras cosillas que se pueden modificar en el '.pretierrc', puedes verlo en la documentación:

  [documentación de prettier](https://prettier.io/docs/en/options.html)


### Pequeño Bug en el código
Cuando hacemos login, si ponemos una contraseña inválida igualmente nos envía el token, y no debería.
Haciendo una especie de debug colocando un console.log en el código, 

```typescript
private validateUser(email: string, password: string): Observable<User> {
    return from(this.findByEmail(email)).pipe(
      switchMap((user: User) =>
        this.authService.comparePasswords(password, user.password).pipe(
          map((match: boolean) => {

            // ### METEMOS EL CONSOLE.LOG AQUÍ
            console.log('### validate User match passwords', match);
            // ### METEMOS EL CONSOLE.LOG AQUÍ

            if (match) {
              const { password, ...result } = user;
              return result;
            } else {
              throw Error;
            }
          }),
        ),
      ),
    );
  }
```

... vemos lo siguiente, por consola:

```
### validate User match passwords Promise { <pending> }
```

Eso nos da que pensar, será un proceso asyncrono que no estamos controlando.

La solución pasa por cambiar el método compare() de bcrypt por compareSync()

```typescript
comparePasswords(
    passwordSended: string,
    passwordHash: string,
  ): Observable<any> {
    const match = bcrypt.compareSync(passwordSended, passwordHash);
    return of<any | boolean>(match);
  }
```
o dejarlo como estaba pero poniendo en vez de of from en el retorno del observable

```typescript
comparePasswords(
    passwordSended: string,
    passwordHash: string,
  ): Observable<any> {
    const match = bcrypt.compare(passwordSended, passwordHash);
    return from<any | boolean>(match);
  }
```

## Task-04: (vídeo-04) JWT- and Role based API Protection | Blog Project

### Custom Decorator

in auth/decorators
```
import { SetMetadata } from '@nestjs/common';

export const hasRoles = (...hasRoles: string[]) =>
  SetMetadata('roles', hasRoles);
```

para usar esto debemos instalar los siguientes paquetes, que incialmente no se encontraban en la instalación de nestjs

```
npm i @nestjs/passport passport passport-jwt --save
```

No olvides en el módulo llamar a los guards, strategy y demás

![jwtAuthGuard](./documentation/screenshots/Screenshot_06_auth-module.png)

En este punto solo podemos acceder a todos los usuarios solo con el role de administrador

![postman endpoint role unauthorized](./documentation/screenshots/Screenshot_07_postman-endpoint-role-admin-unauthorized.png)

Ahora hacemos login y el token devuelto se lo pasamos al get-all-users en el postman, nos devuelve todos los usuarios, debido a que no hemos implementado correctamente todavía el hasRoles('Admin'), ya que no hemos creado los roles, ni el RolesGuard, simplemente tiene un true y pasa la utenticación.

![authRolesGuard](./documentation/screenshots/Screenshot_08_roles-guard.png)

y claro este código todavía no está al 100%

```
  @hasRoles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  findAll(): Observable<User[]> {
    return this.userService.findAll();
  }
```

... solo funciona el JwtAuthGuard el cual pide un jwt en la cabecera, gracias a la estrategia declarada

```
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any): Promise<any> {
    const user = { user: payload.user };
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
```

Ahora vamos a implementar los roles en el usuario:

```
export interface User {
  id?: number;
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}
export enum UserRole {
  ADMIN = 'admin',
  CHIEFEDITOR = 'chiefeditor',
  EDITOR = 'editor',
  USER = 'user',
}
```

![user roles in entity DB](./documentation/screenshots/Screenshot_09_user-entity-for-roles.png)

Fíjate como quedan los métodos del controlador después de indicar quien puede editar borrar, crear, etc

![metodos del controller](./documentation/screenshots/Screenshot_10_user-controller.png)

A partir de entonces no podrás hacer nada sino esres administrador y si no pones el token en la cabecera

```
user: {
  id: 70,
  name: 'prueba 1',
  email: 'admin@prueba1.com',
  role: 'admin',
  password: 'test123'
}
```

las contraseñas son todas iguales, para todos los usuarios 'test123' | 'prueba123'

Si observamos la BD en ElephantSQL, vemos los usuarios que hay hasta ahora, como se ha llamado a la tabla 'user_entity' y los campos correspondientes:

![BD in ElephantSQL](./documentation/screenshots/Screenshot_11_bd_postgrees.png)

A partir de ahora me abstengo de usar ElephantSQL (postgres), para ello alimenté el contenedor de docker que mantiene una base de datos postgresql gratuita en la máquina local.

![docker-compose](./documentation/screenshots/Screenshot_20_docker-container-postgres.png)




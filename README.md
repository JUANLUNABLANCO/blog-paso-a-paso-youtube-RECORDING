# Status Code 666: xNAN (x bd |Nestjs | Angular | Nodejs)

## Getting started

To make it easy for you to get started with GitLab, here's a list of recommended next steps.

Already a pro? Just edit this README.md and make it your own. Want to make it easy?

[Use the template at the bottom](#editing-this-readme)!

### Add your files

- [ ] [Create](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#create-a-file) or [upload](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#upload-a-file) files
- [ ] [Add files using the command line](https://docs.gitlab.com/ee/gitlab-basics/add-file.html#add-a-file-using-the-command-line) or push an existing Git repository with the following command:

```
cd existing_repo
git remote add origin https://gitlab.com/team015485926/Status-Code-666.git
git branch -M main
git push -uf origin main
```

### npm update

```
 npm i -g  npm@9.7.2
```

### Nest installation

```
 npm install -g @nestjs/cli
```

### Comprobación de versiones

```
npm --version  // v9.7.2
node --version // v16.17.0
nest --version // v10.0.5
```

### Crear un nuevo proyecto conn Nestjs

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

### Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Test

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

> npm install --save @nestjs/typeorm typeorm <you prefer> // mysql | pg | mongodb | ...

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

#### Acceptance Criteria:

1. Usar typeorm y el repositorio desde este
2. Usar observables en vez de promesas
3. feature Module "user"
4. user should have properties
   — name
   — email (unique)
   — id (primary key)
5. Use git flow

## TASK 03: Module auth with JWT authentication (login)

**specifictaions**

As a User I want to be able to authenticate myself so I can perform (later protected) requests.

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

```typescript
import { SetMetadata } from '@nestjs/common'

export const hasRoles = (...hasRoles: string[]) =>
  SetMetadata('roles', hasRoles)
```

para usar esto debemos instalar los siguientes paquetes, que incialmente no se encontraban en la instalación de nestjs

```bash
npm i @nestjs/passport passport passport-jwt --save
```

No olvides en el módulo llamar a los guards, strategy y demás

![jwtAuthGuard](./documentation/screenshots/Screenshot_06_auth-module.png)

En este punto solo podemos acceder a todos los usuarios solo con el role de administrador

![postman endpoint role unauthorized](./documentation/screenshots/Screenshot_07_postman-endpoint-role-admin-unauthorized.png)

Ahora hacemos login y el token devuelto se lo pasamos al get-all-users en el postman, nos devuelve todos los usuarios, debido a que no hemos implementado correctamente todavía el hasRoles('Admin'), ya que no hemos creado los roles, ni el RolesGuard, simplemente tiene un true y pasa la utenticación.

![authRolesGuard](./documentation/screenshots/Screenshot_08_roles-guard.png)

y claro este código todavía no está al 100%

```typescript
  @hasRoles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  findAll(): Observable<User[]> {
    return this.userService.findAll();
  }
```

... solo funciona el JwtAuthGuard el cual pide un jwt en la cabecera, gracias a la estrategia declarada

```typescript
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

```typescript
export interface User {
  id?: number
  name?: string
  email?: string
  password?: string
  role?: UserRole
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

```json
"user": {
  "id": 70,
  "name": "prueba 1",
  "email": "admin@prueba1.com",
  "role": "admin",
  "password": "test123"
}
```

las contraseñas son todas iguales, para todos los usuarios 'test123' | 'prueba123'

Si observamos la BD en ElephantSQL, vemos los usuarios que hay hasta ahora, como se ha llamado a la tabla 'user_entity' y los campos correspondientes:

![BD in ElephantSQL](./documentation/screenshots/Screenshot_11_bd_postgrees.png)

A partir de ahora me abstengo de usar ElephantSQL (postgres), para ello alimenté el contenedor de docker que mantiene una base de datos postgresql gratuita en la máquina local.

![docker-compose](./documentation/screenshots/Screenshot_20_docker-container-postgres.png)

## Task-05: Set up angular project with PWA and CORS

**PARTE - 1**

- [+] set up with angular cli
- [+] CORS use cors with NextJs and frontend cors in prdo mode for http-server
- [+] PWA ng add @angular/pwa

**PARTE - 2**

- [+] modules for admin lazy loading
- [+] basic routing between pages: login, register, home= app, admin
- [+] basic components/pages login, register, hoem, admin
- [ ] paginating overview over all users

**bugs pendientes para próximas features**

1. login erróneo cuando no coinciden el email y el password
2. Si envías un email no válido, (postman) da igual, no hay validación backend

## Task-06: (vídeo-06) Set up angular project

1. Angular project set up
2. Create Admin module, and login/register pages and basic routing
3. Verify connection to backend is working

```bash
git flow feature start task-06
ng version                      // ver si tenemos el ng-cli de angular
npm install -g @angular/cli     // lo instalamos sino
```

```
     _                      _                 ____ _     ___
    / \   _ __   __ _ _   _| | __ _ _ __     / ___| |   |_ _|
   / △ \ | '_ \ / _` | | | | |/ _` | '__|   | |   | |    | |
  / ___ \| | | | (_| | |_| | | (_| | |      | |___| |___ | |
 /_/   \_\_| |_|\__, |\__,_|_|\__,_|_|       \____|_____|___|
                |___/


Angular CLI: 16.1.4
Node: 16.17.0
Package Manager: npm 9.7.2
OS: win32 x64

Angular:
...

Package                      Version
------------------------------------------------------
@angular-devkit/architect    0.1601.4 (cli-only)
@angular-devkit/core         16.1.4 (cli-only)
@angular-devkit/schematics   16.1.4 (cli-only)
@schematics/angular          16.1.4 (cli-only)
```

```bash
ng new frontend
cd frontend
ng serve --open
```

Open navigator in localhost:4200

### angular material

```bash
ng add @angular/material
```

Add some component from angular-material like a toolbar material

### modules

```bash
ng g m admin --routing
```

### components

```bash
ng g c admin/components/overview
```

solito se añadirá al módulo padre 'admin'

```bash
ng g c components/login
ng g c components/register
```

mira el routing como se hace, en app-routing.module.ts

```typescript
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { RegisterComponent } from './components/register/register.component'
import { LoginComponent } from './components/login/login.component'

const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.module').then((m) => m.AdminModule),
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
```

en admin-routing.module.ts

```typescript
const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: OverviewComponent,
  },
]
```

### servicio de authentication

```
ng g s services/authentication
```

```
constructor(private http: HttpClient) { }

  login(email: string, password: string) {
    return this.http.post<any>('/api/users/login', { email, password }).pipe( // gracias a nuestra configuración del proxy, la ruta es http://localhost:3000/api/...
      map((token) => {
        // TODO servicio genérico para grabado y recuperación de datos de la app en el localStorage
        localStorage.setItem('SC666_token', token.access_token);
      })
    )
  }
```

en el backend debes configurar para que cada url añada un prefijo api después de http://localhost:3000/ --> http://localhost:3000/api/

--- main.ts ---

```
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  await app.listen(process.env.API_PORT);
}
bootstrap();
```

## Task-07: Cypress Unit testing, e2e testing

### instalación configuración cypress

```bash
mkgir _FRONTEND_NESTJS_API
cd ./_FRONTEND_NESTJS_API
npm install cypress --save-dev
```

Esto instalará la versión v12.17.1 de cypress

```bash
npx cypress open
```

'npx' se diferencia de 'npm', en que si hay conflictos entre instalaciones genéricas y locales usará la local

Esto nos abrirá cypress, con una consola que muestra dos opciones e2e test y components test, seleccionamos el primero e2e.
Ahora nos muestra lo siguiente:

![cypress consola 1](./documentation/screenshoots/Screenshot_13_cy_consola-1.png)

![cypress consola 2](./documentation/screenshoots/Screenshot_14_cy_consola-2.png)

Luego seleccionamos el navegador, en mi caso chrome y veremos un simulador de navegador chrome con algunas características especiales, es una app que nos muestra un menú a la izda.

![cypress chrome browser](./documentation/screenshoots/Screenshot_15_cy_chrome.png)

En la estructura del proyecto, en el FRONTEND aparece una nueva carpeta llamada cypress

Puedes ver tres carpetas en su interior:

1. downloads (vacía)
2. fixtures (con un ejemplo)
3. support
   3.1. commands.ts
   3.2. e2e.ts

además vemos el cypress.config.ts, en la raíz del proyecto FRONTEND

Que contiene el siguiente código por defecto\_

```typescript
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
})
```

![cypress structure folder](./documentation/screenshoots/Screenshot_16_cy_structure-folder.png)

Como no hemos escrito nungún test, no puede encontrarlo y en el navegador de cypress, vemos que en la pestaña 'run' no se está ejecutando nada, sin embargo en la pestaña de Specs hay algunos ejemplos ya desarrollados para poder ver y ejecutar

Si por lo que sea los test te dan un error de sourceMap, cambia en la configuración de tsconfig.json el sourceMap: true a false del compiler options

Cualquier cambio en el código relanzará el tests, está pendiente a cambios, lo que para TDD es perfecto.

El código de esos tests se encuentra en la carpeta:

./cypress/e2e

y es ahí precisamente donde colocaremos nuestros tests, yo seguiría una estructura de historias de usuario:

./cypress/e2e/3 User-Authentication
./cypress/e2e/4 Blog-Components
./cypress/e2e/5 Admin-Panel
./cypress/e2e/6 User-profile
...
Los números son el orden de ejecución de los tests

...

así si el proyecto crece mucho tenemos todo identificado y organizado con una visual

No borremos esos ejemplos, porque ahí hay de todo tipo de tests y nos puede ayudar a entender bastante como fucniona cypress, por otro lado existe una documentación oficial en:

[cypress documentation](https://docs.cypress.io/)

### Nuestros primeros tests

estos tests tienen sentido en el FRONTEND, para tests unitarios del backend podemos usar Karma si fuera necesario, no obstante postman y swagger (el cual admite ejecuciones de las peticiones) son complementarios entre sí, debemos investigar si existe una extensión que simule lo del postman pero que quede un coverage de las pruebas realizadas.

Leámos las tareas del asana una por una para definir esos tests:

1. Task-01:
   Como Jefe Técnico 'Technical Lead', quisiera ver el proyecto funcionando con un 'Hello World!'

Acceptance criteria:
Use git and GitLab - DONE
Api set up with NestJS - DONE
Postgree Database - DONE
.env file - DONE
api have to respond 'Hello world!' - DONE --> test llegando a la url localhost:3000 debemos ver ese mensaje

2. Task-02:
   Como líder o jefe técnico quisiera tener un CRUD básico para la entidad usuario-

Acceptance Criteria:
Usar typeorm y el repositorio desde este —- DONE
Usar observables en vez de promesas —- DONE
feature Module "user" —- DONE
user should have properties —- DONE
— name
— emeil (unique)
— id (primary key) --> test crear un usuario, con 'name', 'email' y ver que al crearlo nos devuelve ese usuario con un 'id'
Use git flow —- DONE

3. Task-03:
   As a User I want to be able to authenticate myself so I can perform (later protected) requests.

Acceptance criteria:
New Endpoint: POST '/login', check password in method —- DONE --> test: acceder al endpoint '/login' check password
Expand User Model with password —- DONE --> test: al crear un usuario este debe guardar una password encriptada en bd
Expand create Endpoint —- DONE
Store 'email' always in lowercase in database —- DONE --> test el email debe estar en minusculas en la BD siempre
Store 'password' always as hashed value in database —- DONE
Add an Auth Module for this —- DONE

![algunos tests y sus resultados](./documentation/screenshoots/Screenshot_17_cy-test-1.png)

![algunos tests y sus resultados](./documentation/screenshoots/Screenshot_18_cy-test1-result.png)

4. Task-04:
   Secure some endpoints with JWT, add a role to the User and protect some endpoints with @hashRole
   As a technical Lead I want that we are able to protect endpoints with a custom hasRole('roleName') annotation, so we can protect endpoints so they are only available for a user with a avlid JWT and the specific role

Acceptance Criteria:
should be able to use the hasRole() annotation — DONE --> test comprobar si una petición necesita el hasRole()
use jwtGuard and RolesGuard — DONE --> test lo mismo para Roles guard
user should have property 'role' — DONE --> todos los usuarios deben tener un role 'user' | 'editor' | 'admin'
protected endpoint (with 'role' admin) PUT 'users/:id/role' to update a user role — DONE --> test solo un usuario con role admmin podrá actualizar el role de otro usuario

5. Task-05:
   As a admin, I want to see all users, for this I want pagination, so i can turn the page, and the users are displayed in a this way. Also we should fix some minor bugs.

Acceptance criteria:
Getting all Users should be pageable, queryParams — DONE --> test ver que funciona la paginacion, crear al menos 15 usuarios para estas comprobaciones
fix minor bugs/issues: — DONE
user should not be able to update his own role — DONE --> test ningún usuario podrá actualizar su propio role, ya lo hicimos anteriormente
Endpoint create(), should always create a user with the role "user" — DONE --> test create() solo puede crear usuarios con role 'user'
Admin is the only that can change roles in users — DONE --> ya lo hicimos en el anterior

6. Task-06:
   As a User I want to navigate between login and register, and overview

Acceptance Criteria:
set up with angular
modules for admin
basic routing --> test ver que se puede acceder a diferentes rutas y que el título de la página se actualiza, no tenemos otros elementos en la página de momento
basic components/pages login, register
paginating overview over all users
use proxy.conf to check if connection server is working. --> test obtener un token si accedemos como administrador

Más adelante cuando decidamos la BD, como va a ser, tendremos una para desarrollo, una para producción y una que se resetea en cada test para testing

Resumiendo e2e tests: FRONTEND <Fecha fin tarea Domingo 23, 00:00>
--> test llegando a la url localhost:3000 debemos ver ese mensaje -- DONE
--> test crear un usuario, con 'name', 'email', 'password' y ver que al crearlo nos devuelve ese usuario con un 'id', prestar atención aquí a las validaciones -- DONE
--> test acceder al endpoint '/login' check password, hay que enviar email + password y deben ser válidas

1.  request: {
    method: 'POST', url: 'http://localhost:4200/users/login', data:{
    name: "test",
    email: "test@gmail.com",
    password:"test123",
    role: 'admin'
    }
    response
    { yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjo1NSwibmFtZSI6InRlc3QiLCJlbWFpbCI6InRlc3RAZ21haWwuY29tIiwicm9sZSI6InVzZXIifSwiaWF0IjoxNjg5NTkxNTc4LCJleHAiOjE2ODk1OTUxNzh9.eoK3ZqgLaXWrY25VeLvAccXvazEEEYRoRRG2Pu8xRvc }

request: other // no está todavía implementado
{
"statusCode": 500,
"message": "Internal server error"
}
--DONE

--> test el email debe estar en minusculas en la BD siempre. Subelo en mayúscula y mira cuando lo crees que devuelve -- DONE

--> test comprobar si una petición necesita el hasRole(), lo mismo para Roles guard(), hay un endpoint del administrador que es el de actualizar el role del usuario, de moemnto solo ese.

// WARNING no hay forma de crear un admin, a no ser que pongamos una lógica tipo, if email = "admin@admin.com" -> role = 'admin'. Ya que todos los usuarios serán role='user' y solo el admin puede cambiar el role de un usuario. Y para estos tests necesitamos poder crear una dmin desde cypress.

--> test todos los usuarios deben tener un role 'user' | 'editor' | 'admin' -- DONE
--> test create() solo puede crear usuarios con role 'user', da igual si envías o no el role -- DONE
--> test ver que funciona la paginacion, crear al menos 15 usuarios para estas comprobaciones, que pasa si pido 5 y solo hay tres ()enviamos tres), o no hay nadie (enviamos un mensaje, no hay usuarios en la base de datos aún o algo similar), controlar si estás en la última página y te pide una más, devolver la misma y lo contrario,
estamos en la primera y queremos ir ahcia atrás. -- DONE

![pagination cypress](./documentation/screenshoots/Screenshot_25_pagination-getallUsers.png)

ver test en el file: './cypress/e2e/3-User-Authentication/07_pagination.cy.js'

Resumiendo e2e tests: BACKEND :alarm_clock: <Fecha fin tarea Domingo 23, 00:00>
--> test llegando a la url localhost:3000 debemos ver ese mensaje
--> test crear un usuario, con 'name', 'email', 'password' y ver que al crearlo nos devuelve ese usuario con un 'id', prestar atención aquí a las validaciones y a los mensajes de error que se devuelven así como el status code
--> test acceder al endpoint '/login' check password, hay que enviar email + password y deben ser válidas
--> test al crear un usuario este debe guardar una password encriptada en bd
--> test el email debe estar en minusculas en la BD siempre
--> test comprobar si una petición necesita el hasRole(), lo mismo para Roles guard(), hay un endpoint del administrador que es el de actualizar el role del usuario, de moemnto solo ese.

--> test todos los usuarios deben tener un role 'user' | 'editor' | 'admin'
--> test create() solo puede crear usuarios con role 'user', da igual si envías o no el role
--> test ver que funciona la paginacion, crear al menos 15 usuarios para estas comprobaciones, que pasa si pido 5 y solo hay tres ()enviamos tres), o no hay nadie (enviamos un mensaje, no hay usuarios en la base de datos aún o algo similar), controlar si estás en la última página y te pide una más, devolver la misma y lo contrario,
estamos en la primera y queremos ir ahcia atrás.

Aquí tenemos ejemplos de tests a peticiones http y los resultados, observamos que cada vez que ejecutamos el test, la primera vez funciona,la segunda falla, porque el email se repitiría, para ello debemos crear una base de datos de testing, que se resetee por completo antes de empezar el test

![cypress test 02 create-user](./documentation/screenshoots/Screenshot_17_cy-test-1.png)

![cypress test 02 create-user-result](./documentation/screenshoots/Screenshot_18_cy-test1-result.png)

## Task-08: Formularios reactivos y validaciones con angular

**description**
Terminemos esos componentes pendientes de angular, con formularios reactivos, validaciones, angular material, etc.

**Acceptance Criteria:**

1. login formulario reactivo con validaciones
2. register formulario reactivo con validaciones
3. Custom validators para 'Comparing Passwords'
4. async validation para emailExist

Vamos con el auth service y el user service, nos hará falta para poder loguearnos, registranos, saber si un usuario ya existe a partir de su email, para ello utilizaremos los endpoints que hemos creado en el backend:

1. **auth.sevice**

- login: http://localhost:4200/api/users/login
- register: http://localhost:4200/api/users/register

estos dos ya los hicimos, vamos con el user service.

2. **user.service**

- emailExists: http://localhost:4200/api/users/exist

Ahora vamos a los componentes, empecemos por el register:

crearemos un formulario reactivo con angular material, con un email, password, password2 y un botón de submit.
Utilizaremos el FormGroup, FormBuilder y el Validators de @angular/forms.

Vamos a la parte de Html y con los mat-form-field creemos esos campos

Para que angular pueda usar reactive forms debemos importar en el 'app.module' lo siguiente:

```typescript
  // app.module.ts
  import { ReactiveFormsModule } from '@angular/forms';
  ...
  imports:[
  ...,
    ReactiveFormsModule
  ]
```

en el componente donde se vaya a usar, lo siguiente:

```typescript
// register.component.ts
import { Component, OnInit } from '@angular/core'
// # reactive forms
import { FormControl, FormGroup } from '@angular/forms'
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  formRegister: FormGroup

  ngOnInit(): void {
    this.formRegister = new FormGroup({
      name: new FormControl(''),
      email: new FormControl(''),
      password: new FormControl(''),
    })
  }
  onSubmit(form: FormGroup) {
    console.log('Valid?', form.valid) // true or false
    console.log('Name', form.value.name)
    console.log('Email', form.value.email)
    console.log('password', form.value.password)
  }
}
```

formRegister es marcado como error del linter: "Property 'formRegister' has no initializer and is not definitely assigned in the constructor."

Pero esto es debido a una configuración del tsconfig.json: o si lo prefieres puedes inicializarlo en el constructor

```typescript
// tsconfig.json
"compilerOptions": {
    "strictPropertyInitialization": false,
    ...
}
```

Un ejemplo de html usando lo anterior sería:

```typescript
// register.component.ts
<form [formGroup]="formRegister" (ngSubmit)="onSubmit(formRegister)">
  <div>
    <label>
      Name:
      <input formControlName="name" placeholder="Your name">
    </label>
  </div>
  <div>
    <label>
      Email:
      <input formControlName="email" placeholder="Your email">
    </label>
  </div>
  <div>
    <label>
      Password:
      <input formControlName="password" placeholder="Your password">
    </label>
  </div>
  <button type="submit">Send</button>
</form>
```

Otra cuestión interesante es usar la clase 'formBuilder' dentro del formGroup de esta manera

```typescript
// register.component.ts
import { FormGroup, FormBuilder } from '@angular/forms'; // hemos eliminado formControl

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.formRegister = this.fb.group({
      name: '',
      email: '',
      password: ''
    });
  }

```

Si importamos la clase Validators también podemos sustituir en cada control de la siguiente manera:

```typescript
  // register.component.ts
  ngOnInit() {
    this.myForm = this.fb.group({
      name: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(8)]],
    });
  }
```

Añadir unos getters para los campos

```typescript
  // register.component.ts
  // # getters
  get nameField() {
    return this.formRegister.get('name');
  }
  get emailField() {
    return this.formRegister.get('email');
  }
  get passwordField() {
    return this.formRegister.get('password');
  }
```

Usarlos en el formulario para la lógica y la validación:

```html
<!-- register.component.html -->
<div>
  <label>
    Email:
    <input formControlName="email" placeholder="Your email" />
  </label>
  <div *ngIf="emailField.invalid && (emailField.dirty || emailField.touched)">
    Please provide a valid email address.
  </div>
  <!-- <div *ngIf="nameField.hasError('required') && (nameField.dirty || nameField.touched)">
      Por favor, el 'nombre' es requerido.
    </div> o por separado cada validación-->
</div>
```

Vemos que el linter también se queja en este caso, error: Object is possibly 'null', vamos al tsconfig.json de nuevo y cambiamos el modo strict: true por strict:false

```json # tsconfig.json
"compilerOptions": {
  "strict": false, ...}
```

o también puedes colocar el signo de interrogación antes del punto del objeto en cuestión, de esta forma:

```html
<div *ngIf="emailField?.invalid && (emailField?.dirty || emailField?.touched)">
  Please provide a valid email address.
</div>
```

## Task 09: Cypress testing

**tests**
--> test crear un usuario, con 'name', 'email', 'password' y ver que al crearlo nos devuelve ese usuario con un 'id', prestar atención aquí a las validaciones, (email correcto y formulario completo)
--> test acceder al endpoint '/login' check password (email válido, formulario completo)
--> test al crear un usuario este debe guardar una password encriptada en bd
--> test el email debe estar en minúsculas en la BD siempre
--> test comprobar si una petición (el admin actualiza un role) necesita el hasRole()
--> test lo mismo para Roles guard()
--> test todos los usuarios deben tener un role de tipo 'user' | 'editor' | 'admin'
--> test create() solo puede crear usuarios con role 'user'
--> test ver que funciona la paginación, crear al menos 15 usuarios para estas comprobaciones

## Task-10: Pagination users and fix some bugs

1. Pagination for getting all users
2. Refactoring code, so the user can´t change his own role, only admin can do that
3. Some other minor refactoring

```bash
git flow feature start task-05
```

1. Recordemos:

- que hicimos en el backend y cómo funcionaba nuestra paginación

2. Postman:

- Hagamos algunos tests de api con postman y lo documentamos

3. Vamos con el frontned\_

- Tablas con angular material
- el servicio
- parámetros en la url
- paginación

4. Cypress e2e tests

## Task 11: filtering by name

```typescript
  findByName(name: string) {
    this.userService
      .paginateByName(0, 10, name)
      .pipe(map((usersPaginated) => (this.dataSource = usersPaginated)))
      .subscribe();
  }
```

## Task 12: User profile

```typescript
  // component
ngOnInit(): void {
    this.subscription = this.activatedRoute.params.subscribe((params) => {
      this.userId = parseInt(params['id']);
      this.usersService
        .findOne(this.userId)
        .pipe(map((user: User) => (this.user = user)))
        .subscribe();
    });
  }
  ...
  // routing
    {
    path: 'users',
    children: [
      ...
      {
            path: ':id',
            component: UserProfileComponent,
            canActivate: [AuthGuard],
          },
        ],
      },
   {
    path: 'update-profile',
    component: UpdateUserProfileComponent,
    canActivate: [
      AuthGuard,
      // TODO UserIsUserGuard
    ],
  },
```

implementemos la parte de subida de un fichero de tipo imagen, para la foto del perfil.

## Task-13 control de errores

En el core existe un módulo completo, para el manejo de errores de todo tipo incluso un componente para probar los errores

También se ha de configurar ciertas cosas en el app.module.ts

```typescript
    ...
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ServerErrorInterceptor,
      multi: true,
    },
    ...
```

## Task-14 Menú, acceso, rutas, guards
Toda la lógica para que en el menú solo aparezcan las opciones correspondientes y además que los guards  impidan el acceso a ciertas rutas si no se está authenticado.

// TODO Para grabar el vídeo fíjate en el otro proyecto `Blog 666` y la lógica del app.component.ts

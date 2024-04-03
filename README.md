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

Toda la lógica para que en el menú solo aparezcan las opciones correspondientes y además que los guards impidan el acceso a ciertas rutas si no se está authenticado.

// TODO Para grabar el vídeo fíjate en el otro proyecto `Blog 666` y la lógica del app.component.ts

## Task 15 Guards, accesos y botones del administrador

Pintaremos en la interfaz solo los botones del administrador (users | admin) si y solo si el usuario está autenticado com administrador

También veremos el user is user gurad, para que solo el usuario que es el que dice ser a través del id de la ruta comprobemos que corresponde con el id del token, para la entrada en el perfil del usuario.

Esta estrategia es diferente a la usada por muchos desarrolladores, que lo que hacen es volcar el peso de esa lógica totalemente en el backend permitiendo la entratda en el path desde el routing pero accediendo inmediatamente a los datos y al ser denegada la autorización por el backend devolviendo un Unauthorized code 401, y el frontned debe primero mostrar un loader y segundo rediirigir al user hacia otra ruta permitida normalmente el login, la decisió nes tuya, puedes hacer la una o la otra, lo único que cambia es la experiencia de usuario que con la primera estartegia cambia puesto que el usuario no va a ver un loader en ningún momento, nisiquiera el frontned va a permitir el acceso al path

## Task 16 Donde estamos y hacia donde vamos

nothing here

## Task 17: @ManyToOne()

Archivos que crearemos:

blog.module.ts, blog-entry.entity.ts, blog-entry.interface...

[Enlace tarea en Asana](https://app.asana.com/0/1204934367072674/1205414675863245/f)

Creamos la rama para esta tarea:

```bash
git flow feature start task_17_ManyToOne
```

Después iremos a la carpeta del backend y crearemos el módulo:

```bash
# npm i -g @nestjs/cli
nest generate module blog
CREATE src/blog/blog.module.ts (81 bytes)
UPDATE src/app.module.ts (840 bytes)
```

Te genera este archivo: blog.module.ts y actualiza el app.mdule.ts

```typescript
import { Module } from '@nestjs/common'

@Module({})
export class BlogModule {}
```

Crearemos dos ficheros dentro de la carpeta ./blog/model: `blog-entry.model.ts` y `blog-entry.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('blog_entry')
export class BlogEntryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  ...
```

Debemos actualizar nuestro `user.entity` y `user.interface`

```typescript
// user.entity
@OneToMany(
    (type) => BlogEntryEntity,
    (blogEntryEntity) => blogEntryEntity.author,
  )
  blogEntries: BlogEntryEntity[];

// user.interface
interface User {
  ...
  blogEntries?: BlogEntry[];
  }
```

y ahora podremos hacer referencia al autor desde blog-entry

```typescript
...
@ManyToOne((type) => UserEntity, (user) => user.blogEntries)
  author: UserEntity;
```

Arranquemos DockerDesktop, la base de datos y el backend, para ver lo que hemos hecho ahasta ahora, si funciona

```bash
# in /_BACKEND_NETSJS_API
npm run docker:db:dev

npm  run nest:dev
```

Si obteneis este error:

```bash
TypeORMError: Entity metadata for UserEntity#blogEntries was not found. Check if you specified a correct entity object and if it's connected in the connection options.
```

Esto es debido a la configuración del módulo, debemos configurar el imports.

```typescript
imports: [TypeOrmModule.forFeature([BlogEntryEntity]), AuthModule, UserModule]
```

Si abrimos la base de datos vemos que la tabla está creada aunque vacía. Y en usuarios no hay ningún campo añadido

```bash
 git status
 git addd .
 git commit -m "Task_17: Many To One relationship with user and blog entries finish."
 git push
 git flow feature finish
```

Hasta aquí este vídeo, espero os haya gustado, si es así ya sabéis, click in like, comment, shared, subscribe, donar en patreon, Onlyfans, os coratis el pelo al cero y hacéis balconning sin piscina.

## Task 18: Control de errores NestJs

Para controlar errores vamos a hacer dos cosas:

1. Crear un handler de errores de tipo http que nos ayude en principio, a diferenciar los errores http y las respuestas a priori.
2. Crear un interceptor para que nos permita mostrar los errores en la interfaz. Nest lo llama filter. Este interceptor o filter se encargará no solo de los errores de tipo http sino todo tipo de errores y así poder mostrarlos en la interfaz y que la app no se rompa.

**1a parte: error handler**

```typescript
import { HttpException, HttpStatus } from '@nestjs/common'

export class ErrorHandler extends Error {
  constructor({
    type,
    message,
  }: {
    type: keyof typeof HttpStatus
    message: string
  }) {
    super(`${type} :: ${message}`)
  }
  public static handleNotFoundError(message: string) {
    throw new HttpException(message, HttpStatus.NOT_FOUND)
  }
  public static handleUnauthorizedError(message: string) {
    throw new HttpException(message, HttpStatus.UNAUTHORIZED)
  }
  public static handleBadRequestError(message: string) {
    throw new HttpException(message, HttpStatus.BAD_REQUEST)
  }
  public static createSigantureError(message: string) {
    const name = message.split(' :: ')[0]
    if (name) {
      throw new HttpException(message, HttpStatus[name])
    } else {
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
```

básicamente esta clase nos permite crear una excepción con un mensaje y un tipo de error, que hereda de la clase Error.
La clase error solo quiere que le pasemos un string, nosotros le metemos en el satring el type y el message para usarlo a nuestro antojo, las clases son estáticas no necesitamos instanciarlas, y la forma de usarlas es la siguiente.

```typescript
// user.service.ts
create(user: User): Observable<{
    user: User;
    token: string;
  }> {
    // Comprobar si el usuario existe en la base de datos
    try {
      // TODO validación de campos
      return this.authService.hashPassword(user.password).pipe(
        // TODO validar todos los campos, que existen y son válidos
        switchMap((passwordHash: string) => {
          // console.log('#### userExists: ', userExists);
          // if (!userExists) {
          const newUser = new UserEntity();
          if (!newUser) {
            console.log('############### entra');
            throw new ErrorHandler({
              type: 'BAD_REQUEST',
              message: 'user not created, something went wrong 1',
            });
          }
          newUser.name = user.name;
          newUser.email = user.email;
          newUser.password = passwordHash;

          if (process.env.CONTROL === 'prod' || process.env.CONTROL === 'dev') {
            newUser.role = UserRole.USER;
          }
          if (user.email == 'admin@admin.com') {
            newUser.role = UserRole.ADMIN;
            console.log('#### ADMIN REGISTER ####', newUser);
          }

          return from(this.userRepository.save(newUser)).pipe(
            switchMap((createdUser: User) => {
              if (createdUser) {
                const { password, ...result } = createdUser;

                return this.authService.generateJWT(createdUser).pipe(
                  map((token: string) => ({
                    user: result,
                    token: token,
                  })),
                  catchError((err) => {
                    throw new ErrorHandler({
                      type: 'BAD_REQUEST',
                      message: 'user not created, something went wrong 2',
                    });
                  }),
                );
              }
            }),
            catchError((err) => {
              throw ErrorHandler.createSigantureError(err.message);
            }),
          );
        }),
      );
    } catch (err) {
      throw err;
    }
  }
```

el create signature es para controlar los errores que se salen de nuestro alcance dentro de los maps, se ponen a nivel de bloque debajo de cada return

**2a parte: All Exceptions Filter**
Por último al crear, nuestro filtro de errores de la siguiente manera:

```typescript
// all-exceptions.filter.ts
import { ArgumentsHost, Catch, HttpException, HttpStatus } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json({
        statusCode: exception.getStatus(),
        message: exception.message,
        timestamp: new Date().toISOString(),
        path: request.url,
      })
    } else {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal Server Error',
        timestamp: new Date().toISOString(),
        path: request.url,
      })
    }
  }
}
```

Diferenciará entre los errores http, que hemos manejado con en error handler y el resto de errores, pero además le añade más información a la estructura (timestamp y path)

Para aplicar este hay que añadirlo en el app.module.ts

```typescript
 providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
```

## Task 19: Validaciones con NestJs

**Aceptance Criteria**

1. Usar Validation Pipe
2. Usar Validaciones con DTOs
3. Usar Validaciones con Decorators de class validator library y class transformer
4. Usar Validaciones con Clases de DTO´s para las requests
5. Usar Validaciones con Interfaces para las responses
6. Manejar todos los errores de validación de forma correcta
7. Utilizar Error Handler para el resto de funciones
8. Manejar la caché para que no interfiera en neustras peticiones en `dev` o `test` Mode.

**Antes de empezar**

```bash

git flow feature start async-validations
```

Nos vamos al bootstrap de nuestra app, para usar el método useGlobalsPipes.

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  // Validaciones con pipe
  app.useGlobalPipes(new ValidationPipe());
```

Co eso estaría ahora vamos a crear nuestros DTO´s, recordar que tenmos el `user.interface.ts`, pero esto no es demasiado profesional porque estamos indicando una interfaz genérica que nos sirve para todo tipo de entradas y salidas para los CRUD´s, veámos esa interfaz como está ahora mismo:

```typescript
// user.interface.ts
import { BlogEntry } from '../../blog/model/blog-entry.interface'

export interface User {
  id?: number
  name?: string
  email?: string
  password?: string
  role?: UserRole
  profileImage?: string
  blogEntries?: BlogEntry[]
}

export enum UserRole {
  ADMIN = 'admin',
  CHIEFEDITOR = 'chiefeditor',
  EDITOR = 'editor',
  USER = 'user',
}
export interface File {
  profileImage: string
}
```

Como vemos cada uno de los parámetros del User tiene el signo `?` que indica que ese puede no estar presente, esto no es demasiado estricto y podríamos crear un usuario con simplemente uno de sus campos.

**Validaciones con DTO´s**

Antes de nada debemos instalar una librería en la que se apoya el ValidationPipe()

```bash
npm i --save class-validator
```

[documentación class validator](https://github.com/typestack/class-validator)

esta otra librería es para hacer transformaciones de objetos planos en clases y viceversa, yo no lo voy a usar en esta ocasión, pero te dejo enlace por aquí si quieres probarlo.

[documentación class transformer](https://github.com/typestack/class-transformer)

**Class Validator** esta librerías usan @ para validar el tipo como: @IsString

```typescript
// user.create.dto.ts
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength, Enum } from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  CHIEFEDITOR = 'chiefeditor',
  EDITOR = 'editor',
  USER = 'user',
}

export class UserCreateDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  password: string;

  @IsString()
  @MinLength(3)
  @MaxLength(255)
  profileImage: string;

  // @IsString()
  // @enum(UserRole)
  // role?: string;
```

**Configuraciones para ver si funciona**
Hay que decir que dar información acerca de la creación de un usuario al frontend es una vulnerabilidad que debemos evitar:
No obstante si queremos ver su funcionamiento debemos deshabilitar moemntáneamente nuestro Filtro de errores y configurar algo en el pipe

```typescript
// app.module.ts
providers: [
    AppService,
    // {
    //   provide: APP_FILTER,
    //   useClass: AllExceptionsFilter,
    // },
```

```typescript
//main.ts
// Validaciones con pipe
app.useGlobalPipes(
  new ValidationPipe({
    disableErrorMessages: false,
    errorHttpStatusCode: 406,
  }),
)
```

`disableErrorMessages: false`, esto viene por defecto a true, el otro es para que devuelva un 406 en vez de 400 'BAD_REQUEST'

Si enviáramos este body, en el registro de un usuario

```json
{
    "name": 1234,
    "email": "correo@valido.es",
    "password": "test12345678"
}
// recibiríamos esta respuesta
{
  "message": [
    "name must be shorter than or equal to 50 characters",
    "debe tener al menos 3 caracteres",
    "name must be a string"
  ],
  "error": "Not Acceptable",
  "statusCode": 406
}
```

Podemos volver a dejar todo como estaba, en cuanto al main.ts, esto lo habilitais o deshabilitais si queréis ver los mensajes de validación, y cuando todas las validaciones estén controladas en los DTO´s sería bueno que le pasárais el control al Error Handler

```typescript
{
  provide: APP_FILTER,
  useClass: AllExceptionsFilter,
},
```

**login DTO**

```typescript
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'

export class UserLoginDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  password: string
}

export interface IUserLoginResponse {
  access_token: string
}
```

**la caché me perjudica en el desarrollo**
Antes de continuar. tras realizar algunas pruebas y cambiar la configuración del `main.ts` con respecto al `validationPipe`, resulta que no vemos esos cambios. Tras informarme a qué puede ser debido, encontramos que lo más lógico es que `la caché de Nest` esté funcionando, así que, nos proponemos controlar esto para el modo `test` y el modo `dev`

[documentación memory caché](https://www.npmjs.com/package/cache-manager)

```bash
npm i --save memory-cache
```

```typescript
import * as cacheManager from 'cache-manager'

const isDevelopment = process.env.NODE_ENV === 'dev'
const isProduction = process.env.NODE_ENV === 'prod'
const isTesting = process.env.NODE_ENV === 'test'

if (isDevelopment || isTesting) {
  // Deshabilitar la caché en modo de desarrollo y de prueba
  cacheManager.caching({ store: 'memory', max: 0 })
} else if (isProduction) {
  // Configurar la caché para el entorno de producción
  // Aquí puedes establecer la configuración de caché deseada para producción
}
```

**Reto o tareas pendientes**
Tarea que os dejo a vosotros, y que en la próxima entrega iréis viendo la solución, así os probáis a vosotros mismos si sois capaces de relizarlo, y si mi cometido como desarrollador y comunicador tiene el efecto que espero en vosotros. La tarea es muy sencilla:

1. controlar todos los errores usando nuestro `ErrorHandler` y el `try catch`, en todas las funciones del user, blog y auth.
2. crear los DTO´s para las validaciones de todas las funciones que faltan: Yo he creado algunos, pero no todos, por lo que sería bueno que intentárais hacer los que podáis y en el próximo vídeo tendréis todos lso DTO´s creados y controles de error.

**Conclusiones**

Hemos aprendido a validar nuestros campos con el `ValidationPipe`, que nos llegan en el body de cada petición, además al mismo tiempo a utilizar los DTO´s para las entradas de datos (Request) y las interfaces para las salidas de datos (Response)

Por otro lado tenemos un control total de los errores devueltos.

y hemos aprendido a cómo gestionar la caché dependiendo del modo en el que estemos.

// WARNING te faltan los errores y el resto de DTO´s

## 20 Blog Entries we contiue

https://app.asana.com/0/1204934367072674/1205421367853549/f

## 21 Blog Entries: updateOne(), deleteOne()

Acceptance Criteria
UserIsAuthorGuard()
UserIsAdminGuard()
updateOne BlogEntrie if userIsAuthorGuard
deletOne BlogEntrie if userIsAdminGuard

## 22 Blog Entries Index by Author

Explainning:
BlogEntries dos nuevos endpoints getAll() and getAllByAuthor()

Acceptance Criteria:

- Necesitamos crear dos endpoints uno para obtener todos los blog entries
- Otro para los blog entries de un author
- ambos deben ser paginados
- haremos pruebas con postman

## 23 Blog Entries Upload an Image

We need a upload image for blog entries endpoint, independent of all endpoints something like
'/api/blogEntries/upload'

Acceptance Criteria:

(PARTE01) —————————————
New Endpoint to upload image for blog-entry
New Endpoint to download an image for blog-entry
save image to the filesystem

(PARTE02) —————————————
update blog entry
refactoring manejo de errores
request to postman collection

## 24 NestJS: User Is User Guard Refactoring

Refactorizar el UserIsUserGuard para que acepte tanto endpoints en los que nos llega un id de usuario, como endpoints en los que no llega y se identifica a través del token

Acceptance Criteria:
debe aceptar un /:id desde la url o no
Si viene ese param id comprobará que sea igual al idFromToken y al idFromReq
Si no viene deberá comprobar que es igual idFromToken al idFromReq
Controlar los posibles errores, preámbulo de la siguiente tarea

## 25 NestJs: Revisar el manejo de errores genérico

Crear una manera sólida en todo el backend sobre el manejo de errores.

**Acceptance Criteria**

**Parte 01**
Manejo de errores al máximo en NestJs
Usar ExceptionFilter para manejo a nivel global de toda la app

**Parte 02**
Analizar el uso de error Handler
Analizar el uso del try {} catch() {}
Analizar el uso de catchError()
En resumen ...

### PARTE 01

**Rama**
feature/task-25_errors

```typescript
  // TODO user is user or user is Admin
  // @UseGuards(JwtAuthGuard, UserIsUserGuard)
  @Get(':id')
  findOneById(@Param() params): Observable<IUser> {
    // throw new Error('Esto es un error ...'); // no se controla, lanza un mensaje de error en consola pero la app se paraliza, necesitas un bloque try {} catch() para interceptarlo
    // vamos a la documentación: https://docs.nestjs.com/exception-filters
    // Nos dice que si no tenemos una exception controlada, por nosotros la capa de excepciones se encarga de proveer al menos una respuesta para las excepciones de tipo Http (HttpExceptions) y si no es una de tipo HttpException enviará la siguiente respuesta
    // {
    //   "statusCode": 500,
    //   "message": "Internal server error",
    // }
    // Si vemos la respuesta cuando enviamos un error no interceptado y que además no es de tipo HttpException, pues es el json de arriba

    // el filtro global de excepciones de NestJs (global exceptions filter) soporta la librería http-errors, muy popular, cada thrown exception contiene un `statusCode` y un `message`

    // si usamos este HttpException, podemos controlar el mensaje y el código de error
    // throw new HttpException('Esto es un error de tipo HttpException', 404);
    // o lo que es lo mismo usando la librería http-errors
    // throw new HttpException('Esto es un error de tipo HttpException', HttpStatus.BAD_REQUEST);
    // si vemos la respuesta en postman observamos el statusCode no solo ne el json sino como error devuelto en el tipo de respuesta

    // Podemos crear el objeto que nosotros necesitemos para la respuesta, ya que el primer parámetro o es un string o puede ser un objeto
    // throw new HttpException(
    //   { error: true, statusCode: 501, serverTime: new Date(), "message": 'This is a custom object'},
    //   400,
    // );

    // hasta aquí vemos que cualquier error lanzado con HttpException será reconocido por NestJs gracias al Global Exceptions filter

    // en los otros parámetros que tenemos dentro del HttpException vemos, el options? que es un objeto y dentro tenemos el cause
    // el cual no se serializará aunque lo implementemos en la respuesta
    // throw new HttpException(
    //   { error: true, statusCode: 501, serverTime: new Date(), "message": 'This is a custom object'},
    //   400,
    // { "cause": error } // el error viene del catch(error) el cual es de tipo Error { name: string, message: string, stack?: string }
    // );

    // por ejemplo, para fines de logger, podemos usar el { cause } para crear un logger personalizado que de más información a los desarrolladores pero no a los usuarios finales.

    // Existen también subclases de HttpException como:
    // BadRequestException, UnauthorizedException, ForbiddenException, NotFoundException, etc
    // throw new ForbiddenException();
    // throw new ForbiddenException('Esto es un error de tipo ForbiddenException');
    // mira la respuesta como cambia:
    // {
    //   statusCode: 403,
    //   message: 'Custom Message',
    //   error: 'Forbidden'
    // }
    // throw new ForbiddenException({message: 'custom forbidden exception', statusCode: 403, serverTime: new Date().toISOString()});
    // throw new NotFoundException('Esto es un error de tipo NotFoundException');

    // Si quieres tener control total de este tipo de excepciones (HttpExceptions) y otras, puedes usar el Global Exceptions Filter que nos provee NestJs y crear un custom exception filter que herede de ahí, y eso es lo que hicimos con el archivo:
    // all-exceptions.filter.ts

    // VE AL ARCHIVO Y ANALIZA LO QUE HACE

    // @Catch() // si vemos la documentación, solo recoge los HttpException --> @Catch(HttpException)
    // export class AllExceptionsFilter extends BaseExceptionFilter {
    //   catch(exception: unknown, host: ArgumentsHost) {
    //     const ctx = host.switchToHttp();
    //     const response = ctx.getResponse();
    //     const request = ctx.getRequest();

    // podemos analizar dentro de exception.cause, exception.message or others
    // el segundo pqarámetro tiene contextos para diferentes Hosts, como Http, Web Sockets, Rpc, ...
    // dentro del response y del request podemos obtener ciertoas cosas como el body, los headers, etc.

    // nosotros hemos hecho una diferencia entre errores de tipo HttpException y otro tipo de errores así lo manejamos todos
    //     if (exception instanceof HttpException) {
    //       response
    //          .status(exception.getStatus())
    //          .json({
    //            statusCode: exception.getStatus(),
    //            timestamp: new Date().toISOString(),
    //            path: request.url,
    //            message: exception.message,
    //          });
    //     } else {
    // RECORDEMOS que esto era el comportamiento por defecto del filtro de excepciones global de nestjs, pero aquí estamos definiendo el objeto a nuestro propio gusto
    //       response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    //         statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    //         timestamp: new Date().toISOString(),
    //         path: request.url,
    //         message: 'Internal server error',
    //       });
    //     }
    //   }
    // }

    // Ahora podemos usar este filter de tres maneras,
    // 1. a nivel de método @UseFilters(new AllExceptionsFilter()) o @UseFilters(AllExceptionsFilter)
    // 2. a nivel de servicio usando el decorador @UseFilters(AllExceptionsFilter) antes de la clase
    // 3. a nivel global en toda la app ya sea desde el amin.ts
    // app.useGlobalFilters(new AllExceptionsFilter());
    // o
    // usando los providers en el app.module.ts

    // de esta manera podríamos no necesitar el try y el catch(), puesto que todos los errores quedan controlados en nuesto
    // AllExceptionsFilter class
    // para probar que esto es así volmeos a nuestro controlador y lanzamos un Error
    // throw new Error()
    // veremos este tipo de respuesta
    // {
    //     statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    //     timestamp: new Date().toISOString(),
    //     path: request.url,
    //     message: 'Internal server error',
    //   }
    // pero si queremos controlar cada tipo de error que se genera en aquellos sitios donde sabemos que puede haber un error de tipo Base de datos, o de tipo jwt, o el que sea, es mejor usar el try {} catch(error) para lanzar lo que nosotros necesitemos, aunque esto no es obligatorio como hemos visto...


    return this.userService.findOneById(params.id);
  }
```

### PARTE 02

Analicemos el uso de errorHandler a través de errores como try catch, veámos el siguiente código en `UserIsUserGuard.ts`

```typescript
// imports ...
@Injectable()
export class UserIsUserGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()
    const params = request.params

    // ID from request
    const user: IUser = request.user ? request.user : null
    const idFromRequest = user?.id ? user.id : null

    // console.log('#### User From request: ', user, params);
    // ID from params
    let idFromParams = null

    // console.log('#### existe params.id' + params.id);
    idFromParams = params?.id ? Number(params.id) : null

    const token = request.headers.authorization
      ? request.headers.authorization.split(' ')[1]
      : null

    // ID from token
    let idFromToken = null

    try {
      // hagamos que falle el token para ver como funciona el errorHandler
      if (token) {
        const jwtDecoded = decode(token, { json: true })
        idFromToken = jwtDecoded.user?.id
      }
    } catch (error) {
      // TODO mirar el uso de ErrorHandler, si es necesario o no...
      // throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      throw ErrorHandler.createSignatureError('Invalid token')
    }
    // id to check
    let idToCheck: number
    if (
      idFromRequest &&
      idFromParams &&
      idFromParams === idFromToken &&
      idFromParams === idFromRequest
    ) {
      console.log('#### Id from Params exists: ' + idFromParams)
      idToCheck = idFromParams
    } else if (
      !idFromParams &&
      idFromRequest &&
      idFromToken === idFromRequest
    ) {
      console.log('#### Id from Params not exists: ')
      idToCheck = idFromToken || idFromRequest
    } else {
      return of(false)
    }
    try {
      return this.userService.findOneById(idToCheck).pipe(
        map((userFromDB: IUser) => {
          let hasPermission = false
          if (userFromDB) {
            console.log('#### userFromDB: ', userFromDB)
            hasPermission = true
          }
          return user && hasPermission
        }),
        catchError((err) => {
          console.log('#### error: usuario no encontrado')
          throw ErrorHandler.handleNotFoundError('User not found')
        }),
      )
    } catch (error) {
      console.log('#### error: BD error')
      throw ErrorHandler.createSignatureError('Error de base de datos')
    }
  }
}
```

En especial esta parte primero:

```typescript
try {
  // hagamos que falle el token para ver como funciona el errorHandler
  if (token) {
    const jwtDecoded = decode(token, { json: true })
    idFromToken = jwtDecoded.user?.id
  }
} catch (error) {
  // TODO mirar el uso de ErrorHandler, si es necesario o no...
  //// @@@@@@@@@@@@ ahora tenemos esto
  throw ErrorHandler.createSignatureError('Invalid token')
  //// @@@@@@ y vamos a probar esto otro
  //// @@@@@@ throw new HttpException('Invalid token!', HttpStatus.UNAUTHORIZED);
}
```

En postman cualquier endpoint que necesite del token para el UserIsUserGuard, modifiquémoslo...
Pero antes observamos que tenemos el `jwtAuthGuard`, el cual valida también el payload

```typescript
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any): Promise<any> {
    // console.log('### payload: ', payload);
    const user = { ...payload.user };
    if (!user) {
      //// @@@@@@ y a quí vemos que está usando thow new UnauthorizedException lo cual devolverá este objeto basado en el AllFilterExceptions.ts
      //// @@@@@@  {
      //// @@@@@@     "statusCode": 401,
      //// @@@@@@     "timestamp": "2024-04-02T17:56:38.364Z",
      //// @@@@@@     "path": "/api/users/3",
      //// @@@@@@     "message": "Invalid token"
      //// @@@@@@  }
      throw new UnauthorizedException();
    }
    return user;
  }
```

Debemos modificar el findUserById del controlador momentáneamente para que no pase por este guard

```typescript
@UseGuards(UserIsUserGuard)
  @Get(':id')
  findOneById(@Param() params): Observable<IUser> {
```

Hemos deshabilitado el JwtAuthGuard, así que ahora vamos a probar el `UserIsUserGuard`

1. La prueba con `throw new HttpException('Invalid token!', HttpStatus.UNAUTHORIZED);`
   respuesta:

```json
{
  "statusCode": 401,
  "timestamp": "2024-04-02T18:06:19.605Z",
  "path": "/api/users/3",
  "message": "Invalid token!"
}
```

2. La prueba con `throw ErrorHandler.createSignatureError('Invalid token');`
   respuesta:

```json
{
  "statusCode": 401,
  "timestamp": "2024-04-02T18:06:19.605Z",
  "path": "/api/users/3",
  "message": "Invalid token!"
}
```

3. throw new UnauthorizedException();
   respuesta:

```json
{
  "statusCode": 401,
  "timestamp": "2024-04-02T18:06:19.605Z",
  "path": "/api/users/3",
  "message": "Unauthorized"
}
```

4. La respuesta con `throw ErrorHandler.handleUnauthorizedError('Invalid token!');`

```json
{
  "statusCode": 401,
  "timestamp": "2024-04-02T18:11:16.920Z",
  "path": "/api/users/3",
  "message": "Invalid token!"
}
```

5. Por último deshabilitemos el try - catch, para ver si hay alguna diferencia
   respuesta:

```json
{
  "statusCode": 500,
  "timestamp": "2024-04-02T18:14:11.242Z",
  "path": "/api/users/3",
  "message": "Internal server error!"
}
```

No es una respuesta adecuada, poruqe no tenemos información referente al error, pero este está siendo manejado, y la app sigue funcionando, gracias a nuestro filter de errores

Como vemos los 5 funcionan perfectamente, entonces, ¿Para qué necesitamos el errorHandler?

Vamos a analizarlo

En primer lugar esta parte ...

```typescript
public static createSignatureError(message: string) {
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR; // Por defecto, código de estado de error interno
    let errorMessage = message; // Por defecto, el mensaje de error completo `500 :: este es un mensaje completo por defecto`

    const errorParts = message.split(' :: ');
    if (errorParts.length === 2) {
      const typeName = errorParts[0].trim();
      const customStatus = HttpStatus[typeName as keyof typeof HttpStatus];
      if (customStatus) {
        statusCode = customStatus;
        errorMessage = errorParts[1].trim();
      }
    }
    throw new HttpException(errorMessage, statusCode);
  }
```

vamos a probarla, que antes no lo hicimos

```typescript
throw ErrorHandler.createSignatureError(
  'UNAUTHORIZED :: FUNCIONA Invalid token!',
)
```

repuesta:

```json
{
  "statusCode": 401,
  "timestamp": "2024-04-02T18:22:05.271Z",
  "path": "/api/users/3",
  "message": "FUNCIONA Invalid token!"
}
```

Como vemos funciona pero es bastante engorroso y no nos aporta nada nuevo,
Ni siquiera las funciones estáticas que hemos creado nos aportan nada nuevo,

```typescript
public static handleNotFoundError(message: string) {
    throw new HttpException(message, HttpStatus.NOT_FOUND);
  }
  public static handleUnauthorizedError(message: string) {
    throw new HttpException(message, HttpStatus.UNAUTHORIZED);
  }
  public static handleBadRequestError(message: string) {
    throw new HttpException(message, HttpStatus.BAD_REQUEST);
  }
```

En definitiva es un puñado de código que no aporta nada nuevo, engorroso y que hace lo mismo pero de peor manera que nuestro `all-exceptions.filter.ts` y encima debes acordarte exactamente de la palabra que vas a usar para el mensaje, `UNhauthorized` o `UNAUTHORIZED` o `Unauthorized` o `UNAUTHORIZED :: FUNCIONA Invalid token!` lo que puede llevar a equivocaiones mientras se desarrolla

Por tanto conclusión en esta primera parte del análisis

1. Eliminaremos esta clase sin remordimientos y usaremos nuestro filter con los exceptions correspondientes, solo cabe recordar que en el `all-exceptions.filter.ts` debemos usar uno de estos:

- throw new HttpException('mensaje', <código de error>)
- o las subclases heredadas de este, sin el código:
  NotFoundException('mensaje'), UnhautorizedException('mensaje'), ...

2. El try catch en sitios de ruptura del código, está bien usarlo, para que no nos devuelva un simple 'Internal Server error'

3. Vamos a analizar que pasa con los `catchError()` de `rxjs`

En esta zona del código tenemos...

Antes debes habilitar el `@UseGuards(JwtAuthGuard, UserIsUserGuard)` JwtAuthGuard, debido a que el JwtAuthGuard es el que valida el token, y el UserIsUserGuard es el que valida que el usuario que se está autenticando es el mismo que se está intentando acceder

```typescript
//// @@@@@@ Un bloque try catch para las respuestas del servicio
try {
  return this.userService.findOneById(idToCheck).pipe(
    map((userFromDB: IUser) => {
      let hasPermission = false
      if (userFromDB) {
        console.log('#### userFromDB: ', userFromDB)
        hasPermission = true
      }
      return user && hasPermission
    }),
    catchError((err) => {
      console.log('#### error: usuario no encontrado')
      throw ErrorHandler.handleNotFoundError('User not found')
    }),
  )
} catch (error) {
  console.log('#### error: BD error')
  throw ErrorHandler.createSignatureError('Error de base de datos')
}
```

Pero si vemos el bloque try - catch que envuelve al servicio no es necesario, ya que el servicio se encarga de los errores a la base de datos, como podemos observar en esta parte del código

```typescript
} catch (err) {
      // console.log('#### err en findOneById 2: ', err);
      throw new InternalServerErrorException(err.message);
    }
```

lo que si podemos hacer es modificar esto dentro del servicio

```typescript
} catch (err) {
      // console.log('#### err en findOneById 2: ', err);
      //// @@@@@@ esto de aquí, que da demasiada información al usuario ...
      throw new InternalServerErrorException(err.message);
      //// @@@@@@ por esto otro, más acertado
      new HttpException(
        'Error en La Base de Datos!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
}
```

Conclusiones:

- 1. try catch, es necesario para controlar mejor los errores en bloques de código donde podemos atrevrnos a pensar que puede haber un error, ya sea de base de datos o de alguna librería como en la decodificaión del jwt. así que lo mantenemos
- 2. el catchError() de rxjs, es necesario para controlar mejor los errores en bloques de código donde tenemos un pipe()

- 3. Eliminaremos todos los controles de errores en los controladores, ya que esto se realiza en el servicio, a no ser que el propio controlador tenga una lógica enrevesada (señal que hay que refactorizar algo), y en todos los casos, se debería realizar en el servicio, y no en el controlador.

- 4. Ahora tenemos un control absoluto de los errores, en un vídeo postrior veremos como dar información a los dearrolladores sin serializar esa información hacia el frontned en el json de respuesta gracias al objeto { options } del propio filter y su parámetro `cause`, que nos permite obtener el error original, y no el error serializado.

- 5. En futuros vídeos, cuando la app esté más avanzada y estemos llevando código a producción indagaremos en esta cuestión:
     `Exploración de herramientas de monitoreo de errores y registros para identificar y solucionar problemas en producción de manera más eficiente.`

Espero hayas encontrado este vídeo útil, si es así me ayudaría mucho que dieras un like, compartieras para llegar a más desarrolladores y así me ayudarías enormemente para poder seguir aportando con más vídeos. Por otro lado puedes comentar, que te ha parecido, y si tienes alguna inquietud relacionada con estas cuestiones.

Y si entras en mi cuenta de OnlyFans puedes subscribirte por 1000€ al mes, ...

https://www.onlyfans.com/user/nacho_la_tiene_mas_larga_que_tu_digo_codifica_mejor_que_tu

Gracias por estar ahí y te espero pronto en el próximo vídeo, se acercan cosas interesantes los DTO´s llevados a su máxima expresión.

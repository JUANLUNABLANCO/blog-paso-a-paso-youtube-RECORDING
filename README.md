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
### Probemso
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

#### Pasos
1. crear  el módulo, servicio, controlador, etc

```bash
# module
cd src
nest generate module user

# service
cd user
nest generate service user

# controller
nest generate controller user
```

modificar los nombres de las carpetas que correspondan

vrear además manualmente los siguientes:

./model/user.entity.ts
./model/user.interface.ts

-- ver ficheros creados --

2. Arrancar app
3. ir a postman y probar todo
4. git flow





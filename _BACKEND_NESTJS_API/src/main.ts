import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { caching } from 'cache-manager';
import { AllExceptionsFilter } from './core/errors/all-exceptions.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, { cors: true });
    // ############ cache
    const isDevelopment = process.env.NODE_ENV === 'dev';
    const isProduction = process.env.NODE_ENV === 'prod';
    const isTesting = process.env.NODE_ENV === 'test';
    const isLocal = process.env.NODE_ENV === 'local';

    if (isDevelopment || isTesting || isLocal) {
      // Deshabilitar la caché en modo de desarrollo y de prueba
      const memoryCache = await caching('memory', { ttl: 0, max: 0 }); // tiempo de vida 0 segundos, máximo número de lementos en caché 0
    } else if (isProduction) {
      // Configurar la caché para el entorno de producción
      // Aquí puedes establecer la configuración de caché deseada para producción
      // [documentación memory caché](https://www.npmjs.com/package/cache-manager)
    }
    // validaciones con pipe
    app.useGlobalPipes(
      new ValidationPipe({
        disableErrorMessages:
          process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'test'
            ? false
            : true,
        errorHttpStatusCode: 406,
        whitelist: true,
        forbidNonWhitelisted: false,
        stopAtFirstError: true,
      }),
    );
    // **** EXCEPTION FILTERS *****
    app.useGlobalFilters(new AllExceptionsFilter());
    // ***** CORS *****
    const origins = [
      `${process.env.APP_URL_ORIGIN}:${process.env.APP_PORT_ORIGIN}`,
      'http://localhost:4200',
      'http://127.0.0.1:4200',
    ];
    const corsConfig = {
      origin: origins,
      allowedHeaders:
        'Access-Control-Allow-Origin, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe, Authorization',
      methods: 'GET,PUT,POST,DELETE',
      preflightContinue: false,
      credentials: true,
    };
    app.enableCors(corsConfig);
    console.log('## ORIGIN: ', origins);
    // ***** CORS *****
    app.setGlobalPrefix('api');
    console.log('control: ', process.env.control);
    // ##################################### SWAGGER CONFIGURATION
    if (
      process.env.NODE_ENV === 'local' ||
      process.env.NODE_ENV === 'test' ||
      process.env.NODE_ENV === 'dev'
    ) {
      const swaggerConfig = new DocumentBuilder()
        .setTitle('NESTJS API')
        .setDescription('API description with Swagger')
        .setVersion('1.0')
        // .addBearerAuth()
        .build();
      const document = SwaggerModule.createDocument(app, swaggerConfig);
      SwaggerModule.setup('docs', app, document);
    }
    // ##################################### SWAGGER CONFIGURATION
    await app.listen(process.env.API_PORT);
  } catch (error) {
    console.error('Error crítico al iniciar NestJS:', error);
  }
}
bootstrap();

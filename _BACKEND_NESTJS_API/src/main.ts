import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { caching } from 'cache-manager';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  // validaciones con pipe
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages:
        process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'test'
          ? false
          : true,
      errorHttpStatusCode: 406,
      whitelist: true,
      forbidNonWhitelisted: false,
      stopAtFirstError: true,
    }),
  );
  // ***** CACHE ****
  const isDevelopment = process.env.NODE_ENV === 'dev';
  const isProduction = process.env.NODE_ENV === 'prod';
  const isTesting = process.env.NODE_ENV === 'test';

  if (isDevelopment || isTesting) {
    const memoryCache = await caching('memory', { ttl: 0, max: 0 });
  } else if (isProduction) {
    // configuración de la caché para producción
  }
  // ***** CORS *****
  const origins = `${process.env.APP_URL_ORIGIN}:${process.env.APP_PORT_ORIGIN}`; // 'http://127.0.0.1:8080';
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
  await app.listen(process.env.API_PORT);
}
bootstrap();

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    helmet({
      // Swagger UI necesita scripts/estilos inline.
      contentSecurityPolicy: false,
    }),
  );

  // Validación global de DTOs: rechaza campos desconocidos y devuelve 400.
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('FleetCore API')
    .setDescription('Gestión del mantenimiento de la flota de vehículos de FleetCore')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'api-key')
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerConfig));

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`FleetCore API: http://localhost:${port}  |  Swagger: http://localhost:${port}/docs`);
}
await bootstrap();

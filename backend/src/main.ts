import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { seedManager } from './seed';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
  });

  const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const allowAll = corsOrigins.includes('*');

  const matchOrigin = (origin: string) =>
    corsOrigins.some((entry) => {
      if (entry === '*') return true;
      if (entry.startsWith('*.')) {
        const suffix = entry.slice(1);
        return origin.endsWith(suffix);
      }
      return origin === entry;
    });

  app.enableCors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (matchOrigin(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked: ${origin}`), false);
    },
    credentials: !allowAll,
  });

  app.setGlobalPrefix('api', { exclude: ['health'] });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('NewsWave API')
    .setDescription('Regional and National News Portal API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await seedManager(app);

  const port = parseInt(process.env.PORT || '4000', 10);
  await app.listen(port);
  console.log(`NewsWave API running on http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();

import fastifyCors from "@fastify/cors";
import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "@/app/app.module";

import { HttpExceptionFilter } from "@/shared/filters/http-exception.filter";
import { TransformInterceptor } from "@/shared/interceptors/transform.interceptor";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Configuración CORS dinámica para desarrollo, ngrok e IP local
  await app
    .getHttpAdapter()
    .getInstance()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    .register(fastifyCors, {
      origin: (origin, cb) => {
        // En desarrollo permitimos: localhost, ngrok y cualquier IP de red local (192.168.x.x o 10.x.x.x)
        if (!origin || 
            origin === "http://localhost:3001" || 
            origin.endsWith(".ngrok-free.dev") ||
            /^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(origin)) {
          cb(null, true);
          return;
        }
        cb(new Error("Not allowed by CORS"), false);
      },
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Authorization", "Content-Type"],
      credentials: true,
    });

  const config = new DocumentBuilder()
    .setTitle("Eventos SaaS API")
    .setDescription("The API description for Eventos SaaS Backend")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<string>("PORT", "3000");

  await app.listen(port, "0.0.0.0");

  const logger = app.get(Logger);
  logger.log(`App is ready and listening on port ${port} 🚀`);
}

bootstrap().catch(handleError);

function handleError(error: unknown) {
  // eslint-disable-next-line no-console
  console.error(error);
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
}

process.on("uncaughtException", handleError);

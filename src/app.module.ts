import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';
import { TodoModule } from './modules/todo/todo.module';
import jwtConfig from './config/jwt.config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // 1 minute
          limit: 100, // 100 requests per minute
        },
        {
          ttl: 3600000, // 1 hour
          limit: 1000, // 1000 requests per hour
        },
      ],
    }),
    AuthenticationModule,
    TodoModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    // Temporarily disable throttling for debugging
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class AppModule { }

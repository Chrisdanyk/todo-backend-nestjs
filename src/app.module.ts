import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';
import { TodoModule } from './modules/todo/todo.module';
import { TodoModule } from './modules/todo/todo.module';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
      envFilePath: '.env',
    }),
    AuthenticationModule,
    TodoModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule { }

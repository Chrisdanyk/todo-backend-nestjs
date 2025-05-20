import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { PrismaService } from 'src/prisma.service';
@Module({
  providers: [AuthenticationService, PrismaService],
  controllers: [AuthenticationController]
})
export class AuthenticationModule { }

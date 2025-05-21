import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
@Module({
  providers: [AuthenticationService, PrismaService, JwtService],
  controllers: [AuthenticationController],
})
export class AuthenticationModule { }

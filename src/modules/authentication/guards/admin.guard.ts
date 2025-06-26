import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Role } from 'generated/prisma';

interface JwtPayload {
  id: string;
  email: string;
  role: Role;
}

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly logger = new Logger(AdminGuard.name);

  constructor(private jwtService: JwtService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest<Request>();
      const token = this.extractTokenFromHeader(request);

      if (!token) {
        this.logger.error('No token provided');
        throw new UnauthorizedException('No token provided');
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_KEY,
      });

      if (payload.role !== 'ADMIN') {
        this.logger.error('User is not an admin');
        throw new ForbiddenException('User is not an admin');
      }

      request['user'] = payload;
      return true;
    } catch (error) {
      this.logger.error('Authentication failed:', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

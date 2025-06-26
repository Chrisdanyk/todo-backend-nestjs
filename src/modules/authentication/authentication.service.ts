import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User, Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma.service';
import { PaginatedResult, paginate } from 'src/providers/prisma/paginator';
import { UserSerializer } from 'src/providers/serializers/user.serializer';
import { LoginDto, RefreshTokenDto, AuthResponseDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup-dto';
import { randomUUID } from 'crypto';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) { }

  private async createRefreshToken(userId: string, family: string): Promise<string> {
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        family,
        expiresAt,
      },
    });

    return token;
  }

  private async revokeRefreshTokenFamily(family: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { family },
      data: { used: true },
    });
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new NotFoundException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!passwordMatch) {
      throw new BadRequestException('Invalid credentials');
    }

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '1h',
    });
    const family = randomUUID();
    const refresh_token = await this.createRefreshToken(user.id, family);

    return new AuthResponseDto({
      access_token,
      refresh_token,
      id: user.id,
      email: user.email,
    });
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    try {
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshTokenDto.refresh_token },
        include: { user: true },
      });

      if (
        !storedToken ||
        storedToken.used ||
        storedToken.expiresAt < new Date()
      ) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Mark the current token as used
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { used: true },
      });

      // Revoke all tokens in the same family
      await this.revokeRefreshTokenFamily(storedToken.family);

      const payload: JwtPayload = {
        id: storedToken.user.id,
        email: storedToken.user.email,
        role: storedToken.user.role,
      };

      const access_token = await this.jwtService.signAsync(payload, {
        expiresIn: '1h',
      });
      const family = randomUUID();
      const refresh_token = await this.createRefreshToken(
        storedToken.user.id,
        family,
      );

      return new AuthResponseDto({
        access_token,
        refresh_token,
        id: storedToken.user.id,
        email: storedToken.user.email,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (storedToken) {
      await this.revokeRefreshTokenFamily(storedToken.family);
    }
  }

  async signUp(signupDto: SignupDto): Promise<void> {
    try {
      const { email, password } = signupDto;

      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new BadRequestException('User already exists');
      }

      const passwordHash = await bcrypt.hash(password, 10);

      await this.prisma.user.create({
        data: {
          email,
          password: passwordHash,
        },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('User registration failed');
    }
  }

  async createUser(user: User) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: user.email },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    return await this.prisma.user.create({
      data: user,
    });
  }

  async updateUser(id: string, user: User) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    return await this.prisma.user.update({
      where: { id },
      data: user,
    });
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.prisma.user.delete({
      where: { id },
    });
  }

  async listUsers(params?: {
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
    page?: number;
  }): Promise<User[] | PaginatedResult<User>> {
    if (!params?.page) {
      return await this.prisma.user.findMany({
        where: params?.where,
        orderBy: params?.orderBy,
      });
    }

    const paginatedResult = await paginate(
      this.prisma.user,
      {
        where: params.where,
        orderBy: params.orderBy,
      },
      {
        page: params.page,
      },
    );

    return {
      ...paginatedResult,
      data: paginatedResult.data.map((user) => new UserSerializer(user as any)),
    };
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return new UserSerializer(user as any);
  }

  async me(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return new UserSerializer(user as any);
  }
}

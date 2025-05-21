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
import { LoginDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup-dto';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) { }

  async login(loginDto: LoginDto) {
    try {
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

      const payload = {
        id: user.id,
        email: user.email,
      };

      const access_token = await this.jwtService.signAsync(payload);

      return {
        access_token,
        id: user.id,
        email: user.email,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new UnauthorizedException('Authentication failed');
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
      data: paginatedResult.data.map((user) => new UserSerializer(user)),
    };
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return new UserSerializer(user);
  }
}

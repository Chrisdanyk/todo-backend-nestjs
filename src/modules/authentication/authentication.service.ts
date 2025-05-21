import { Injectable } from '@nestjs/common';
import { User, Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma.service';
import {
  PaginatedResult,
  paginate,
} from 'src/providers/prisma/paginator';

@Injectable()
export class AuthenticationService {
  constructor(private readonly prisma: PrismaService) { }

  login() {
    return 'Login';
  }

  signup() {
    return 'Signup';
  }

  async createUser(user: User) {
    return await this.prisma.user.create({
      data: user,
    });
  }

  async updateUser(id: string, user: User) {
    return await this.prisma.user.update({
      where: { id },
      data: user,
    });
  }

  async deleteUser(id: string) {
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

    return paginate(
      this.prisma.user,
      {
        where: params.where,
        orderBy: params.orderBy,
      },
      {
        page: params.page,
      },
    );
  }

  async getUser(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }
}

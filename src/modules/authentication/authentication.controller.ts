import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { Prisma } from 'generated/prisma';

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) { }

  @Post('login')
  login() {
    return this.authenticationService.login();
  }

  @Post('signup')
  signup() {
    return this.authenticationService.signup();
  }

  @Get('users')
  async listUsers(
    @Query('page') page?: number,
    @Query('where') where?: Prisma.UserWhereInput,
    @Query('orderBy') orderBy?: Prisma.UserOrderByWithRelationInput,
  ) {
    return await this.authenticationService.listUsers({
      page: page ? Number(page) : 1,
      where,
      orderBy,
    });
  }

  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    return await this.authenticationService.getUser(id);
  }
}

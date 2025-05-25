import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { Prisma, User } from 'generated/prisma';
import {
  LoginDto,
  SignupDto,
  RefreshTokenDto,
  UpdateMeDto,
  UpdateUserDto,
} from './dto';
import { UserSerializer } from 'src/providers/serializers/user.serializer';
import { AdminGuard, AuthGuard } from './guards';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) { }

  @Post('login')
  @HttpCode(200)
  login(@Body() loginDto: LoginDto) {
    return this.authenticationService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(200)
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authenticationService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authenticationService.logout(refreshTokenDto.refresh_token);
  }

  @Post('signup')
  signup(@Body() signupDto: SignupDto) {
    return this.authenticationService.signUp(signupDto);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Req() req: { user: { id: string } }) {
    return await this.authenticationService.me(req.user.id);
  }

  @Put('me')
  @UseGuards(AuthGuard)
  async updateMe(
    @Body() updateMeDto: UpdateMeDto,
    @Req() req: { user: { id: string } },
  ) {
    const existingUser = await this.authenticationService.getUser(req.user.id);
    const user = await this.authenticationService.updateUser(req.user.id, {
      ...existingUser,
      name: updateMeDto.name,
    } as User);
    return new UserSerializer(user as any);
  }

  @Get('users')
  @UseGuards(AdminGuard)
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
  @UseGuards(AdminGuard)
  async getUser(@Param('id') id: string) {
    return await this.authenticationService.getUser(id);
  }

  @Put('users/:id')
  @UseGuards(AdminGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.authenticationService.updateUser(id, {
      ...updateUserDto,
    } as User);
  }

  @Delete('users/:id')
  @UseGuards(AdminGuard)
  @HttpCode(204)
  async deleteUser(@Param('id') id: string) {
    await this.authenticationService.deleteUser(id);
    return null;
  }
}

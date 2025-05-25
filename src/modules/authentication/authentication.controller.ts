import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { Prisma } from 'generated/prisma';
import { LoginDto, SignupDto, RefreshTokenDto } from './dto';

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

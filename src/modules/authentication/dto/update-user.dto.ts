import { IsOptional, IsString } from 'class-validator';
import { Role } from 'generated/prisma';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  role: Role;
}

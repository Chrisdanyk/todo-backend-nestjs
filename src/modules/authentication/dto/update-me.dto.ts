import { IsOptional, IsString } from 'class-validator';
import { Role } from 'generated/prisma';

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  role?: Role;
}

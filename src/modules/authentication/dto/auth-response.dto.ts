import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AuthResponseDto {
  @Expose()
  access_token: string;

  @Expose()
  refresh_token: string;

  @Expose()
  id: string;

  @Expose()
  email: string;

  constructor(partial: Partial<AuthResponseDto>) {
    Object.assign(this, partial);
  }
} 
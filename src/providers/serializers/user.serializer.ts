import { Exclude, Expose } from 'class-transformer';

export class UserSerializer {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Exclude()
  password: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<UserSerializer>) {
    Object.assign(this, partial);
  }
}

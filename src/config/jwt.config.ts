import { JwtModuleOptions } from '@nestjs/jwt';

export default (): JwtModuleOptions => {
  const secret = process.env.JWT_KEY;
  if (!secret) {
    throw new Error('JWT_KEY environment variable is not set');
  }

  return {
    secret,
    signOptions: {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    },
  };
};
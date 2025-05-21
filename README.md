# Todo Backend API

A robust and scalable backend API for a Todo application built with NestJS and Prisma.

## 🚀 Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) - A progressive Node.js framework for building efficient and scalable server-side applications
- **Database ORM**: [Prisma](https://www.prisma.io/) - Next-generation ORM for Node.js and TypeScript
- **Authentication**: [@nestjs/jwt](https://github.com/nestjs/jwt) - JWT authentication for NestJS
- **Password Hashing**: [bcrypt](https://github.com/dcodeIO/bcrypt.js) - Password hashing library
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript
- **Testing**: [Jest](https://jestjs.io/) - JavaScript testing framework
- **Code Quality**:
  - [ESLint](https://eslint.org/) - Code linting
  - [Prettier](https://prettier.io/) - Code formatting

## 📋 Prerequisites

- Node.js (v18 or higher)
- pnpm (Package manager)
- PostgreSQL (Database)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend-nestjs
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit the `.env` file with your database credentials and other configuration.

4. Set up the database:
```bash
pnpm prisma generate
pnpm prisma migrate dev
```

## 🚀 Running the Application

### Development
```bash
pnpm start:dev
```

### Production
```bash
pnpm build
pnpm start:prod
```

## 🧪 Testing

```bash
# Unit tests
pnpm test

# e2e tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

## 📁 Project Structure

```
src/
├── modules/         # Feature modules
├── providers/       # Service providers
├── templates/       # Template files
├── types/          # TypeScript type definitions
├── app.module.ts   # Root application module
├── main.ts         # Application entry point
└── prisma.service.ts # Prisma database service
```

## 🔑 API Documentation

The API documentation will be available at `/api` when running the application.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

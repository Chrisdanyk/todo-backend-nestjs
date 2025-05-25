import { IsString } from "class-validator";

export class CreateTodoDto {
  id        String   @id @default(uuid())
  title     String
  completed Boolean @default (false)
  createdAt DateTime @default (now())
  updatedAt DateTime @updatedAt
  userId    String
  user      User @relation(fields: [userId], references: [id])
}

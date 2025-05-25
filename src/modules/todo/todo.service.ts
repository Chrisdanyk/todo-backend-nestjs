import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class TodoService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createTodoDto: CreateTodoDto) {
    return await this.prisma.todo.create({
      data: createTodoDto,
    });
  }

  async findAll() {
    return await this.prisma.todo.findMany()
  }

  async findOne(id: string) {
    const todo = await this.prisma.todo.findUnique({
      where: { id },
    });

    if (!todo) {
      throw new NotFoundException('Item not found');
    }

    return todo;
  }

  async update(id: string, updateTodoDto: UpdateTodoDto) {
    const existingTodo = await this.findOne(id);
    return await this.prisma.todo.update({
      where: { id: existingTodo.id },
      data: { ...updateTodoDto },
    });
  }

  async remove(id: string) {
    return await this.prisma.todo.delete({
      where: { id },
    });
  }
}

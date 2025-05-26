import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { PrismaService } from '../../prisma.service';
import { Prisma, Todo } from 'generated/prisma';
import { paginate, PaginatedResult } from 'src/providers/prisma/paginator';

@Injectable()
export class TodoService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createTodoDto: CreateTodoDto) {
    return await this.prisma.todo.create({
      data: createTodoDto,
    });
  }

  async findAll(params?: {
    where?: Prisma.TodoWhereInput;
    orderBy?: Prisma.TodoOrderByWithRelationInput;
    page?: number;
  }): Promise<Todo[] | PaginatedResult<Todo>> {
    if (!params?.page) {
      return await this.prisma.todo.findMany({
        where: params?.where,
        orderBy: params?.orderBy,
      })
    }

    const paginatedResult = await paginate(
      this.prisma.todo,
      {
        where: params.where,
        orderBy: params.orderBy,
      },
      {
        page: params.page,
      },
    );

    return {
      ...paginatedResult,
      data: paginatedResult.data,
    };
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

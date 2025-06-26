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
    // Get the highest order value for this user's todos
    const maxOrder = await this.prisma.todo.aggregate({
      where: { userId: createTodoDto.userId },
      _max: { order: true },
    });

    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    return await this.prisma.todo.create({
      data: {
        title: createTodoDto.title,
        completed: createTodoDto.completed ?? false,
        userId: createTodoDto.userId,
        order: nextOrder,
      },
    });
  }

  async findAll(params?: {
    where?: Prisma.TodoWhereInput;
    orderBy?: Prisma.TodoOrderByWithRelationInput;
    page?: number;
    limit?: number;
  }): Promise<Todo[] | PaginatedResult<Todo>> {
    const defaultOrderBy = { order: 'asc' as const };
    const defaultLimit = 50; // Reasonable limit for large datasets
    const maxLimit = 100; // Maximum limit to prevent abuse

    const limit = Math.min(params?.limit || defaultLimit, maxLimit);

    if (!params?.page) {
      return await this.prisma.todo.findMany({
        where: params?.where,
        orderBy: params?.orderBy || defaultOrderBy,
        take: limit,
      });
    }

    const paginatedResult = await paginate(
      this.prisma.todo,
      {
        where: params.where,
        orderBy: params.orderBy || defaultOrderBy,
      },
      {
        page: params.page,
        perPage: limit,
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

  async reorderTodos(todoIds: string[], userId: string) {
    // For large datasets, we need to be more efficient
    if (todoIds.length > 1000) {
      throw new Error('Cannot reorder more than 1000 todos at once');
    }

    // Verify all todos belong to the user
    const todos = await this.prisma.todo.findMany({
      where: {
        id: { in: todoIds },
        userId: userId,
      },
      select: { id: true }, // Only select ID for efficiency
    });

    if (todos.length !== todoIds.length) {
      throw new Error('Some todos not found or do not belong to user');
    }

    // Use batch updates for better performance
    const batchSize = 100;

    for (let i = 0; i < todoIds.length; i += batchSize) {
      const batch = todoIds.slice(i, i + batchSize);
      await Promise.all(
        batch.map((todoId, batchIndex) =>
          this.prisma.todo.update({
            where: { id: todoId },
            data: { order: i + batchIndex },
          })
        )
      );
    }

    return { message: 'Todos reordered successfully' };
  }

  async markAllCompleted(userId: string, completed: boolean): Promise<void> {
    // Use direct update instead of fetching all todos first
    await this.prisma.todo.updateMany({
      where: {
        userId,
        completed: !completed, // Only update todos that need to change
      },
      data: { completed },
    });
  }

  async deleteCompletedTodos(userId: string): Promise<void> {
    // Use direct delete instead of fetching all todos first
    await this.prisma.todo.deleteMany({
      where: {
        userId,
        completed: true,
      },
    });
  }

  async getTodoStats(userId: string) {
    const [total, completed, active] = await Promise.all([
      this.prisma.todo.count({ where: { userId } }),
      this.prisma.todo.count({ where: { userId, completed: true } }),
      this.prisma.todo.count({ where: { userId, completed: false } }),
    ]);

    return {
      total,
      completed,
      active,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Req,
  HttpCode,
  ForbiddenException,
  Query,
  PipeTransform,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { AuthGuard } from '../authentication/guards';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto';
import { Prisma } from 'generated/prisma';

// Custom UUID validation pipe that's more lenient
@Injectable()
export class CustomUUIDPipe implements PipeTransform {
  transform(value: any) {
    if (typeof value !== 'string') {
      throw new BadRequestException('ID must be a string');
    }

    // Basic UUID v4 validation (more lenient)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new BadRequestException('Invalid UUID format');
    }

    return value;
  }
}

@Controller('todos')
@UseGuards(AuthGuard)
export class TodoController {
  constructor(private readonly todoService: TodoService) { }

  @Post()
  create(
    @Body() createTodoDto: CreateTodoDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.todoService.create({ ...createTodoDto, userId: req.user.id });
  }

  @Get()
  findAll(
    @Req() req: { user: { id: string } },
    @Query('page') page?: string,
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string,
  ) {
    let parsedWhere: Prisma.TodoWhereInput = { userId: req.user.id };
    let parsedOrderBy: Prisma.TodoOrderByWithRelationInput | undefined;

    // Parse where clause if provided
    if (where) {
      try {
        const whereObj = JSON.parse(where) as Prisma.TodoWhereInput;
        parsedWhere = { ...parsedWhere, ...whereObj };
      } catch (error) {
        console.error('Failed to parse where clause:', error);
      }
    }

    // Parse orderBy clause if provided
    if (orderBy) {
      try {
        parsedOrderBy = JSON.parse(orderBy) as Prisma.TodoOrderByWithRelationInput;
      } catch (error) {
        console.error('Failed to parse orderBy clause:', error);
      }
    }

    return this.todoService.findAll({
      page: page ? Number(page) : 1,
      where: parsedWhere,
      orderBy: parsedOrderBy,
    });
  }

  @Get('stats')
  async getStats(@Req() req: { user: { id: string } }) {
    try {
      console.log('📊 Stats request for user:', req.user.id);
      const stats = await this.todoService.getTodoStats(req.user.id);
      console.log('📊 Stats response:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Stats error:', error);
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id', CustomUUIDPipe) id: string, @Req() req: { user: { id: string } }) {
    const todo = await this.todoService.findOne(id);
    if (todo.userId !== req.user.id) {
      throw new ForbiddenException('You are not allowed to access this todo');
    }
    return todo;
  }

  @Put(':id')
  async update(
    @Param('id', CustomUUIDPipe) id: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @Req() req: { user: { id: string } },
  ) {
    const todo = await this.todoService.findOne(id);
    if (todo.userId !== req.user.id) {
      throw new ForbiddenException('You are not allowed to update this todo');
    }
    return this.todoService.update(todo.id, updateTodoDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', CustomUUIDPipe) id: string, @Req() req: { user: { id: string } }) {
    console.log('🗑️ Delete request:', { todoId: id, userId: req.user.id });

    try {
      const todo = await this.todoService.findOne(id);
      console.log('🗑️ Found todo:', {
        todoId: todo.id,
        todoUserId: todo.userId,
        reqUserId: req.user.id
      });

      if (todo.userId !== req.user.id) {
        console.log('❌ Delete forbidden: user mismatch');
        throw new ForbiddenException('You are not allowed to delete this todo');
      }

      console.log('✅ Delete authorized, proceeding with deletion');
      await this.todoService.remove(todo.id);
      console.log('✅ Todo deleted successfully');
      return null;
    } catch (error) {
      console.error('❌ Delete error:', error);
      throw error;
    }
  }

  @Post('reorder')
  async reorder(
    @Body() body: { todoIds: string[] },
    @Req() req: { user: { id: string } },
  ) {
    return this.todoService.reorderTodos(body.todoIds, req.user.id);
  }

  @Post('mark-all-completed')
  async markAllCompleted(
    @Body() body: { completed: boolean },
    @Req() req: { user: { id: string } },
  ) {
    await this.todoService.markAllCompleted(req.user.id, body.completed);
    return { message: 'Todos updated successfully' };
  }

  @Delete('completed')
  async deleteCompletedTodos(@Req() req: { user: { id: string } }) {
    await this.todoService.deleteCompletedTodos(req.user.id);
    return { message: 'Completed todos deleted successfully' };
  }
}

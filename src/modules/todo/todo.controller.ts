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
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { AuthGuard } from '../authentication/guards';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto';
import { Prisma } from 'generated/prisma';

@Controller('todos')
// @UseGuards(AuthGuard)
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
    @Query('page') page?: number,
    @Query('where') where?: Prisma.TodoWhereInput,
    @Query('orderBy') orderBy?: Prisma.TodoOrderByWithRelationInput,
  ) {
    return this.todoService.findAll({
      page: page ? Number(page) : 1,
      where,
      orderBy,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    const todo = await this.todoService.findOne(id);
    if (todo.userId !== req.user.id) {
      throw new ForbiddenException('You are not allowed to access this todo');
    }
    return todo;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
    const todo = await this.todoService.findOne(id);
    return this.todoService.update(todo.id, updateTodoDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    const todo = await this.todoService.findOne(id);
    await this.todoService.remove(todo.id);
    return null;
  }
}

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('includeDrafts') includeDrafts?: string,
  ) {
    const pageNum = page ? Math.max(1, parseInt(page, 10)) || 1 : 1;
    const limitNum = limit ? Math.max(1, parseInt(limit, 10)) || 10 : 10;
    const includeDraftsBool = includeDrafts === 'true';
    return this.postsService.findAll(pageNum, limitNum, includeDraftsBool);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() postData: any, @Request() req) {
    return this.postsService.create(postData, req.user.userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() postData: any, @Request() req) {
    return this.postsService.update(id, postData, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Request() req) {
    return this.postsService.delete(id, req.user.userId);
  }
}

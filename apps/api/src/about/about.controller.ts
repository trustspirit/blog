import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { AboutService } from './about.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('about')
export class AboutController {
  constructor(private aboutService: AboutService) {}

  @Get()
  async getAbout() {
    return this.aboutService.getAbout();
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  async updateAbout(@Body() body: { content: string }, @Request() req) {
    return this.aboutService.updateAbout(body.content);
  }
}

import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common'
import { AboutService } from './about.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('about')
export class AboutController {
  constructor(private aboutService: AboutService) {}

  @Get()
  async getAbout() {
    return this.aboutService.getAbout()
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  async updateAbout(@Body() body: { content: string }) {
    if (!body.content || typeof body.content !== 'string') {
      throw new BadRequestException('Content is required and must be a string')
    }
    return this.aboutService.updateAbout(body.content)
  }
}

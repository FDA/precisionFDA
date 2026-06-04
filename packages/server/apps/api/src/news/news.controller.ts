import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { PaginatedResult } from '@shared/domain/entity/domain/paginated.result'
import { NewsItemDTO } from '@shared/domain/news-item/dto/news-item.dto'
import { NewsListDTO } from '@shared/domain/news-item/dto/news-list.dto'
import { NewsItem } from '@shared/domain/news-item/news-item.entity'
import { NewsItemService } from '@shared/domain/news-item/service/news-item.service'
import { SiteAdminGuard } from '../admin/guards/site-admin.guard'

@Controller('/news')
export class NewsController {
  constructor(private readonly newsItemService: NewsItemService) {}

  @Get()
  async listNews(@Query() query: NewsListDTO): Promise<PaginatedResult<NewsItem>> {
    return await this.newsItemService.listNews(query)
  }

  @UseGuards(SiteAdminGuard)
  @Get('/all')
  async getAllNews(@Query() query: NewsListDTO): Promise<NewsItem[]> {
    return await this.newsItemService.getAllNews(query)
  }

  @Get('/years')
  async listYears(): Promise<number[]> {
    return await this.newsItemService.listYears()
  }

  @Get('/:id')
  async getNews(@Param('id', ParseIntPipe) id: number): Promise<NewsItem> {
    return await this.newsItemService.getNews(id)
  }

  @UseGuards(SiteAdminGuard)
  @HttpCode(204)
  @Delete('/:id')
  async deleteNews(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.newsItemService.deleteNews(id)
  }

  @UseGuards(SiteAdminGuard)
  @HttpCode(201)
  @Post()
  async createNews(@Body() body: NewsItemDTO): Promise<Partial<NewsItem>> {
    return await this.newsItemService.createNews(body)
  }

  @UseGuards(SiteAdminGuard)
  @HttpCode(204)
  @Put('/:id')
  async updateNews(@Param('id', ParseIntPipe) id: number, @Body() body: NewsItemDTO): Promise<void> {
    await this.newsItemService.updateNews(id, body)
  }
}

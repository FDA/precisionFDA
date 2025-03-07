import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ExpertService } from '@shared/domain/expert/services/expert.service'
import { SiteAdminGuard } from '../admin/guards/site-admin.guard'
import { ExpertPaginationDTO } from '@shared/domain/expert/dto/expert-pagination.dto'

@Controller('/experts')
export class ExpertsController {
  constructor(private readonly expertService: ExpertService) {}

  @Get()
  async listExperts(@Query() query: ExpertPaginationDTO) {
    return await this.expertService.listExperts(query)
  }

  @Get('/years')
  async getYears() {
    return await this.expertService.getYears()
  }

  @UseGuards(SiteAdminGuard)
  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.expertService.delete(id)
  }

  @HttpCode(200)
  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number) {
    return await this.expertService.getExpert(id)
  }
}

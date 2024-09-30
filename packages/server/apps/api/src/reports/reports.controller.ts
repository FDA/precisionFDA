import {
  Body,
  Controller,
  Delete,
  Get,
  ParseArrayPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { SpaceReportCreateDto } from '@shared/domain/space-report/model/space-report-create.dto'
import { SpaceReportService } from '@shared/domain/space-report/service/space-report.service'
import { SpaceReportCreateFacade } from '../facade/space-report/space-report-create.facade'
import { SpaceReportDeleteFacade } from '../facade/space-report/space-report-delete.facade'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { SpaceReportListQueryDto } from './model/space-report-list.dto'

@UseGuards(UserContextGuard)
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly spaceReportCreateFacade: SpaceReportCreateFacade,
    private readonly spaceReportService: SpaceReportService,
    private readonly spaceReportDeleteFacade: SpaceReportDeleteFacade,
  ) {}

  // TODO(PFDA-4831) - cover reports with integration tests after setting up full test env
  @Post()
  async createReport(@Body() createDto: SpaceReportCreateDto) {
    const report = await this.spaceReportCreateFacade.createSpaceReport(createDto)

    return report?.id
  }

  @Get()
  async getReports(@Query() query: SpaceReportListQueryDto) {
    return await this.spaceReportService.getReportsForScope(query.scope)
  }

  @Delete()
  async deleteReports(@Query('id', new ParseArrayPipe({ items: Number })) ids: number[]) {
    return await this.spaceReportDeleteFacade.deleteSpaceReports(ids)
  }
}

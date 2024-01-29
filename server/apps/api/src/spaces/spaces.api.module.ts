import { Module } from '@nestjs/common'
import { SpaceReportModule } from '@shared/domain/space-report/space-report.module'
import { SpaceReportApiFacadeModule } from '../facade/space-report/space-report-api-facade.module'
import { SpacesController } from './spaces.controller'

@Module({
  imports: [SpaceReportApiFacadeModule, SpaceReportModule],
  controllers: [SpacesController],
})
export class SpacesApiModule {}

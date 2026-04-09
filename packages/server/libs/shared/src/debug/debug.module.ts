import { Module } from '@nestjs/common'
import { AdminDataConsistencyReportService } from '@shared/debug/admin-data-consistency-report.service'
import { EmailModule } from '@shared/domain/email/email.module'

@Module({
  imports: [EmailModule],
  providers: [AdminDataConsistencyReportService],
  exports: [AdminDataConsistencyReportService],
})
export class DebugModule {}

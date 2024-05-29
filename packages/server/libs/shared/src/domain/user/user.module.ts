import { Module } from '@nestjs/common'
import { UserDataConsistencyReportService } from '@shared/domain/user/user-data-consistency-report.service'
import { EmailModule } from '@shared/domain/email/email.module'

@Module({
  imports: [EmailModule],
  providers: [UserDataConsistencyReportService],
  exports: [UserDataConsistencyReportService],
})
export class UserModule {}

import { Module } from '@nestjs/common'
import { UserDataConsistencyReportService } from '@shared/domain/user/user-data-consistency-report.service'
import { EmailModule } from '@shared/domain/email/email.module'
import { UserService } from '@shared/domain/user/user.service'

@Module({
  imports: [EmailModule],
  providers: [UserDataConsistencyReportService, UserService],
  exports: [UserDataConsistencyReportService, UserService],
})
export class UserModule {}

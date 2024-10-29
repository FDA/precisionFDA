import { Module } from '@nestjs/common'
import { UserDataConsistencyReportService } from '@shared/domain/user/user-data-consistency-report.service'
import { EmailModule } from '@shared/domain/email/email.module'
import { UserService } from '@shared/domain/user/user.service'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { User } from '@shared/domain/user/user.entity'

@Module({
  imports: [EmailModule, MikroOrmModule.forFeature([User])],
  providers: [UserDataConsistencyReportService, UserService],
  exports: [UserDataConsistencyReportService, UserService, MikroOrmModule],
})
export class UserModule {}

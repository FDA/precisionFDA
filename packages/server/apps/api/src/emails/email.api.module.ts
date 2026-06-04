import { Module } from '@nestjs/common'
import { EmailModule } from '@shared/domain/email/email.module'
import { EmailsController } from './emails.controller'

@Module({
  imports: [EmailModule],
  controllers: [EmailsController],
})
export class EmailApiModule {}

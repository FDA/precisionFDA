import { Module } from '@nestjs/common'
import { EmailController } from './email.controller'
import { EmailModule } from '@shared/domain/email/email.module'

@Module({
  imports: [EmailModule],
  controllers: [EmailController],
})
export class EmailApiModule {}

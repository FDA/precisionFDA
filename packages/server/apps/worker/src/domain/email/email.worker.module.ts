import { Module } from '@nestjs/common'
import { EmailQueueProcessor } from './processor/email-queue.processor'
import { EmailModule } from '@shared/domain/email/email.module'

@Module({
  imports: [EmailModule],
  providers: [EmailQueueProcessor],
})
export class EmailWorkerModule {}

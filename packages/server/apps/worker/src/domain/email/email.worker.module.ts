import { Module } from '@nestjs/common'
import { EmailModule } from '@shared/domain/email/email.module'
import { EmailQueueProcessor } from './processor/email-queue.processor'

@Module({
  imports: [EmailModule],
  providers: [EmailQueueProcessor],
})
export class EmailWorkerModule {}

import { Module } from '@nestjs/common'
import { EmailQueueProcessor } from './processor/email-queue.processor'

@Module({
  providers: [EmailQueueProcessor],
})
export class EmailWorkerModule {}

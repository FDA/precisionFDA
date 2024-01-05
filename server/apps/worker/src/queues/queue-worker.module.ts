import { Module } from '@nestjs/common'
import { QueueModule } from '@shared/queue/queue.module'
import { MainQueueProcessor } from './processor/main-queue.processor'
import { MaintenanceQueueProcessor } from './processor/maintenance-queue.processor'

@Module({
  imports: [QueueModule],
  providers: [MainQueueProcessor, MaintenanceQueueProcessor],
})
export class QueueWorkerModule {}

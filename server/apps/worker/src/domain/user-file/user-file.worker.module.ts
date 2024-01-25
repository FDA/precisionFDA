import { Module } from '@nestjs/common'
import { FileSyncQueueProcessor } from './processor/file-sync-queue.processor'

@Module({
  providers: [FileSyncQueueProcessor],
})
export class UserFileWorkerModule {}

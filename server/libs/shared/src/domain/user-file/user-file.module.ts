import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { config } from '@shared'
import { fileCloseOperationProvider } from '@shared/domain/user-file/providers/file-close-operation.provider'
import { nodesRemoveOperationProvider } from '@shared/domain/user-file/providers/nodes-remove-operation.provider'
import { UserFileService } from '@shared/domain/user-file/service/user-file.service'

@Module({
  imports: [
    BullModule.registerQueue({
      name: config.workerJobs.queues.fileSync.name,
      defaultJobOptions: {
        // if set to false, it will eventually eat up space in the redis instance
        removeOnComplete: true,
        removeOnFail: true,
        priority: 7,
      },
    }),
  ],
  providers: [UserFileService, nodesRemoveOperationProvider, fileCloseOperationProvider],
  exports: [UserFileService, BullModule, nodesRemoveOperationProvider, fileCloseOperationProvider],
})
export class UserFileModule {}

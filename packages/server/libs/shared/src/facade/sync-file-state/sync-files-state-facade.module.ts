import { Module } from '@nestjs/common'
import { SyncFilesStateFacade } from '@shared/facade/sync-file-state/sync-files-state.facade'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { RemoveNodesFacadeModule } from '@shared/facade/node-remove/remove-nodes-facade.module'
import { ChallengeModule } from '@shared/domain/challenge/challenge.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'

@Module({
  imports: [
    PlatformClientModule,
    RemoveNodesFacadeModule,
    UserFileModule,
    ChallengeModule,
  ],
  providers: [SyncFilesStateFacade],
  exports: [SyncFilesStateFacade],
})
export class SyncFilesStateFacadeModule {}

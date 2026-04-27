import { Module } from '@nestjs/common'
import { ChallengeModule } from '@shared/domain/challenge/challenge.module'
import { DataPortalModule } from '@shared/domain/data-portal/data-portal.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { RemoveNodesFacadeModule } from '@shared/facade/node-remove/remove-nodes-facade.module'
import { SyncFilesStateFacade } from '@shared/facade/sync-file-state/sync-files-state.facade'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'

@Module({
  imports: [PlatformClientModule, RemoveNodesFacadeModule, UserFileModule, ChallengeModule, DataPortalModule],
  providers: [SyncFilesStateFacade],
  exports: [SyncFilesStateFacade],
})
export class SyncFilesStateFacadeModule {}

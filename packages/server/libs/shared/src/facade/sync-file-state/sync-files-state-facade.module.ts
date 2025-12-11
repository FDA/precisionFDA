import { Module } from '@nestjs/common'
import { SyncFilesStateFacade } from '@shared/facade/sync-file-state/sync-files-state.facade'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { RemoveNodesFacadeModule } from '@shared/facade/node-remove/remove-nodes-facade.module'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Challenge } from '@shared/domain/challenge/challenge.entity'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'

@Module({
  imports: [
    PlatformClientModule,
    RemoveNodesFacadeModule,
    UserFileModule,
    MikroOrmModule.forFeature([Challenge]),
  ],
  providers: [SyncFilesStateFacade],
  exports: [SyncFilesStateFacade],
})
export class SyncFilesStateFacadeModule {}

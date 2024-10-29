import { Module } from '@nestjs/common'
import { RemoveNodesFacade } from '@shared/facade/node-remove/remove-nodes.facade'
import { UserModule } from '@shared/domain/user/user.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { ComparisonModule } from '@shared/domain/comparison/comparison.module'
import { SpaceModule } from '@shared/domain/space/space.module'
import { TaggingModule } from '@shared/domain/tagging/tagging.module'
import { SpaceEventModule } from '@shared/domain/space-event/space-event.module'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { LicensedItemModule } from '@shared/domain/licensed-item/licensed-item.module'

@Module({
  imports: [
    UserModule,
    UserFileModule,
    ComparisonModule,
    SpaceModule,
    SpaceEventModule,
    TaggingModule,
    LicensedItemModule,
    PlatformClientModule,
  ],
  providers: [RemoveNodesFacade],
  exports: [RemoveNodesFacade],
})
export class RemoveNodesFacadeModule {}

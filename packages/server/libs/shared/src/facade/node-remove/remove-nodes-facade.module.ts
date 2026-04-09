import { Module } from '@nestjs/common'
import { ComparisonModule } from '@shared/domain/comparison/comparison.module'
import { EventModule } from '@shared/domain/event/event.module'
import { LicensedItemModule } from '@shared/domain/licensed-item/licensed-item.module'
import { SpaceModule } from '@shared/domain/space/space.module'
import { SpaceEventModule } from '@shared/domain/space-event/space-event.module'
import { TaggingModule } from '@shared/domain/tagging/tagging.module'
import { UserModule } from '@shared/domain/user/user.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { RemoveNodesFacade } from '@shared/facade/node-remove/remove-nodes.facade'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'

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
    EventModule,
  ],
  providers: [RemoveNodesFacade],
  exports: [RemoveNodesFacade],
})
export class RemoveNodesFacadeModule {}

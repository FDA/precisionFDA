import { Module } from '@nestjs/common'
import { DataPortalModule } from '@shared/domain/data-portal/data-portal.module'
import { SpaceModule } from '@shared/domain/space/space.module'
import { CreateDataPortalFacade } from '@shared/facade/data-portal-create/create-data-portal.facade'

@Module({
  imports: [DataPortalModule, SpaceModule],
  providers: [CreateDataPortalFacade],
  exports: [CreateDataPortalFacade],
})
export class CreateDataPortalFacadeModule {}

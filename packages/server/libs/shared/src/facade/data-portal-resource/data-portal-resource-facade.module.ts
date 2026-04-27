import { Module } from '@nestjs/common'
import { DataPortalModule } from '@shared/domain/data-portal/data-portal.module'
import { ResourceModule } from '@shared/domain/resource/resource.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { RemoveNodesFacadeModule } from '../node-remove/remove-nodes-facade.module'
import { DataPortalResourceRemoveFacade } from './data-portal-resource-remove.facade'

@Module({
  imports: [DataPortalModule, UserFileModule, ResourceModule, RemoveNodesFacadeModule],
  providers: [DataPortalResourceRemoveFacade],
  exports: [DataPortalResourceRemoveFacade],
})
export class DataPortalResourceFacadeModule {}

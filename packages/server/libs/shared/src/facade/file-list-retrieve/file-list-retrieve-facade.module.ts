import { Module } from '@nestjs/common'
import { LicenseModule } from '@shared/domain/license/license.module'
import { SpaceModule } from '@shared/domain/space/space.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { FileListRetrieveFacade } from './file-list-retrieve.facade'

@Module({
  imports: [UserFileModule, SpaceModule, LicenseModule],
  providers: [FileListRetrieveFacade],
  exports: [FileListRetrieveFacade],
})
export class FileListRetrieveFacadeModule {}

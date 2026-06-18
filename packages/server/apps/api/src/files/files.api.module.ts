import { Module } from '@nestjs/common'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { UserFileCreateFacadeModule } from '@shared/facade/file-create/user-file-create-facade.module'
import { FileListRetrieveFacadeModule } from '@shared/facade/file-list-retrieve/file-list-retrieve-facade.module'
import { UserFileApiFacadeModule } from '../facade/user-file/user-file-api-facade.module'
import { FilesController } from './files.controller'

@Module({
  imports: [UserFileModule, UserFileApiFacadeModule, UserFileCreateFacadeModule, FileListRetrieveFacadeModule],
  controllers: [FilesController],
})
export class FilesApiModule {}

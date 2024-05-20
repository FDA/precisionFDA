import { Module } from '@nestjs/common'
import { FilesController } from './files.controller'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { UserFileApiFacadeModule } from '../facade/user-file/user-file-api-facade.module'

@Module({
  imports: [UserFileModule, UserFileApiFacadeModule],
  controllers: [FilesController],
})
export class FilesApiModule {}

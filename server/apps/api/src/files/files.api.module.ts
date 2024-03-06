import { Module } from '@nestjs/common'
import { FilesController } from './files.controller'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'

@Module({
  imports: [UserFileModule],
  controllers: [FilesController],
})
export class FilesApiModule {}

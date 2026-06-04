import { Module } from '@nestjs/common'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { FoldersController } from './folders.controller'

@Module({
  imports: [UserFileModule],
  controllers: [FoldersController],
})
export class FolderApiModule {}

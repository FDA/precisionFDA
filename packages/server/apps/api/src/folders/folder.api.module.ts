import { Module } from '@nestjs/common'
import { FolderController } from './folder.controller'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'

@Module({
  imports: [UserFileModule],
  controllers: [FolderController],
})
export class FolderApiModule {}

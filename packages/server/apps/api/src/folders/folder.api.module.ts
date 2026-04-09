import { Module } from '@nestjs/common'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { FolderController } from './folder.controller'

@Module({
  imports: [UserFileModule],
  controllers: [FolderController],
})
export class FolderApiModule {}

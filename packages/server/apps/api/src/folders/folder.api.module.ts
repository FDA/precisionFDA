import { Module } from '@nestjs/common'
import { FolderController } from './folder.controller'

@Module({
  controllers: [FolderController],
})
export class FolderApiModule {}

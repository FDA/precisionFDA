import { Module } from '@nestjs/common'
import { PlatformModule } from '@shared/domain/platform/platform.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { UserFileCreateFacade } from '@shared/facade/file-create/user-file-create.facade'

@Module({
  imports: [PlatformModule, UserFileModule],
  providers: [UserFileCreateFacade],
  exports: [UserFileCreateFacade],
})
export class UserFileCreateFacadeModule {}

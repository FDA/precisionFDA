import { Module } from '@nestjs/common'
import { JobModule } from '@shared/domain/job/job.module'
import { PlatformModule } from '@shared/domain/platform/platform.module'
import { UserModule } from '@shared/domain/user/user.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { UserFileCreateFacade } from '@shared/facade/file-create/user-file-create.facade'

@Module({
  imports: [PlatformModule, UserFileModule, JobModule, UserModule],
  providers: [UserFileCreateFacade],
  exports: [UserFileCreateFacade],
})
export class UserFileCreateFacadeModule {}

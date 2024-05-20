import { Module } from '@nestjs/common'
import { PlatformFileService } from '@shared/domain/platform/service/platform-file.service'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'

@Module({
  imports: [PlatformClientModule, UserFileModule],
  providers: [PlatformFileService],
  exports: [PlatformFileService],
})
export class PlatformModule {}

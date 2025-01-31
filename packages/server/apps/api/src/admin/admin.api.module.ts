import { Module } from '@nestjs/common'
import { AdminController } from './admin.controller'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { UserModule } from '@shared/domain/user/user.module'

@Module({
  imports: [PlatformClientModule, UserModule],
  controllers: [AdminController],
})
export class AdminApiModule {}

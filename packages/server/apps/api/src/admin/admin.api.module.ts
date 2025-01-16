import { Module } from '@nestjs/common'
import { AdminController } from './admin.controller'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'

@Module({
  imports: [PlatformClientModule],
  controllers: [AdminController],
})
export class AdminApiModule {}

import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { adminPlatformClientProvider } from '@shared/platform-client/providers/admin-platform-client.provider'
import {
  challengeBotClientProvider,
  platformClientProvider,
} from '@shared/platform-client/providers/platform-client.provider'

@Module({
  imports: [HttpModule],
  providers: [platformClientProvider, challengeBotClientProvider, adminPlatformClientProvider],
  exports: [platformClientProvider, challengeBotClientProvider, adminPlatformClientProvider],
})
export class PlatformClientModule {}

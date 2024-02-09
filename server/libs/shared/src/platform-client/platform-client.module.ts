import { Module } from '@nestjs/common'
import {
  challengeBotClientProvider,
  platformClientProvider,
} from '@shared/platform-client/providers/platform-client.provider'

@Module({
  providers: [platformClientProvider, challengeBotClientProvider],
  exports: [platformClientProvider, challengeBotClientProvider],
})
export class PlatformClientModule {}

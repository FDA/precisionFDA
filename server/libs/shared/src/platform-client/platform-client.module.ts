import { Module } from '@nestjs/common'
import { platformClientProvider } from '@shared/platform-client/providers/platform-client.provider'

@Module({
  providers: [platformClientProvider],
  exports: [platformClientProvider],
})
export class PlatformClientModule {}

import { Module } from '@nestjs/common'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { AppService } from '@shared/domain/app/services/app.service'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'

@Module({
  imports: [PlatformClientModule, UserFileModule],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}

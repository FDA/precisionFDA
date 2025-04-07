import { Module } from '@nestjs/common'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { AppService } from '@shared/domain/app/services/app.service'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { App } from '@shared/domain/app/app.entity'

@Module({
  imports: [PlatformClientModule, UserFileModule, MikroOrmModule.forFeature([App])],
  providers: [AppService],
  exports: [AppService, MikroOrmModule],
})
export class AppModule {}

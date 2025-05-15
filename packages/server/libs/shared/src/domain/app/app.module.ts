import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { AppService } from '@shared/domain/app/services/app.service'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { AppSeries } from '../app-series/app-series.entity'
import { Asset } from '../user-file/asset.entity'
import { App } from './app.entity'

@Module({
  imports: [PlatformClientModule, MikroOrmModule.forFeature([AppSeries, App, Asset])],
  providers: [AppService],
  exports: [AppService, MikroOrmModule],
})
export class AppModule {}

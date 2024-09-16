import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppModule } from '@shared/domain/app/app.module'

@Module({
  imports: [AppModule],
  controllers: [AppController],
})
export class AppApiModule {}

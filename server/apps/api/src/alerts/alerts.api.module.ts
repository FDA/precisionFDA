import { Module } from '@nestjs/common'
import { AlertModule } from '@shared/domain/alert/alert.module'
import { AlertsController } from './alerts.controller'

@Module({
  imports: [AlertModule],
  controllers: [AlertsController],
})
export class AlertsApiModule {}

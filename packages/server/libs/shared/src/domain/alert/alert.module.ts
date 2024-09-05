import { Module } from '@nestjs/common'
import { AlertService } from '@shared/domain/alert/services/alert.service'

@Module({
  providers: [AlertService],
  exports: [AlertService],
})
export class AlertModule {}

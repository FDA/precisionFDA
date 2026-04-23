import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { Alert } from '@shared/domain/alert/entity/alert.entity'
import { AlertService } from '@shared/domain/alert/services/alert.service'

@Module({
  imports: [MikroOrmModule.forFeature([Alert])],
  providers: [AlertService],
  exports: [AlertService],
})
export class AlertModule {}

import { Module } from '@nestjs/common'
import { ComparisonService } from '@shared/domain/comparison/comparison.service'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Comparison } from '@shared/domain/comparison/comparison.entity'

@Module({
  imports: [MikroOrmModule.forFeature([Comparison])],
  providers: [ComparisonService],
  exports: [ComparisonService, MikroOrmModule],
})
export class ComparisonModule {}

import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { Comparison } from '@shared/domain/comparison/comparison.entity'
import { ComparisonService } from '@shared/domain/comparison/comparison.service'

@Module({
  imports: [MikroOrmModule.forFeature([Comparison])],
  providers: [ComparisonService],
  exports: [ComparisonService, MikroOrmModule],
})
export class ComparisonModule {}

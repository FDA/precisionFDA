import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { Answer } from '@shared/domain/answer/answer.entity'

@Module({
  imports: [MikroOrmModule.forFeature([Answer])],
  providers: [],
  exports: [MikroOrmModule],
})
export class AnswerModule {}

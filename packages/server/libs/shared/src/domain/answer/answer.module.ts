import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { Answer } from '@shared/domain/answer/answer.entity'
import AnswerRepository from '@shared/domain/answer/answer.repository'

@Module({
  imports: [MikroOrmModule.forFeature([Answer])],
  providers: [AnswerRepository],
  exports: [MikroOrmModule, AnswerRepository],
})
export class AnswerModule {}

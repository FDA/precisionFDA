import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { ExpertQuestion } from '@shared/domain/expert-question/entity/expert-question.entity'
import { ExpertQuestionService } from '@shared/domain/expert-question/service/expert-question.service'

@Module({
  imports: [MikroOrmModule.forFeature([ExpertQuestion])],
  providers: [ExpertQuestionService],
  exports: [ExpertQuestionService],
})
export class ExpertQuestionModule {}

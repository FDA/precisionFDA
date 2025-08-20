import { Module } from '@nestjs/common'
import { ChallengeModule } from '@shared/domain/challenge/challenge.module'
import { EntityModule } from '@shared/domain/entity/entity.module'
import { ExpertQuestionModule } from '@shared/domain/expert-question/expert-question.module'
import { ExpertModule } from '@shared/domain/expert/expert.module'
import { entityTypeToSearchResultMapperProvider } from '@shared/facade/search/provider/search-result-mapper.provider'
import { SearchResultChallengeMapper } from '@shared/facade/search/result-mapper/search-result-challenge-mapper'
import { SearchResultExpertMapper } from '@shared/facade/search/result-mapper/search-result-expert-mapper'
import { SearchResultExpertQuestionMapper } from '@shared/facade/search/result-mapper/search-result-expert-question-mapper'
import { SearchFacade } from '@shared/facade/search/search.facade'

@Module({
  imports: [EntityModule, ChallengeModule, ExpertModule, ExpertQuestionModule],
  providers: [
    SearchFacade,
    SearchResultChallengeMapper,
    SearchResultExpertMapper,
    SearchResultExpertQuestionMapper,
    entityTypeToSearchResultMapperProvider,
  ],
  exports: [SearchFacade],
})
export class SearchFacadeModule {}

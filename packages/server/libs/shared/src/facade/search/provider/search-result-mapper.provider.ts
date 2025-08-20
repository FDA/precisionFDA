import { FactoryProvider } from '@nestjs/common'
import { EntityTypeToSearchResultMapperMap } from '@shared/facade/search/domain/entity-type-to-search-result-mapper.map'
import { SearchResultChallengeMapper } from '@shared/facade/search/result-mapper/search-result-challenge-mapper'
import { SearchResultExpertMapper } from '@shared/facade/search/result-mapper/search-result-expert-mapper'
import { SearchResultExpertQuestionMapper } from '@shared/facade/search/result-mapper/search-result-expert-question-mapper'

export const ENTITY_TYPE_TO_RESULT_MAPPER_MAP = 'SPACE_TYPE_TO_CREATOR_PROVIDER_MAP'

export const entityTypeToSearchResultMapperProvider: FactoryProvider = {
  provide: ENTITY_TYPE_TO_RESULT_MAPPER_MAP,
  inject: [SearchResultChallengeMapper, SearchResultExpertMapper, SearchResultExpertQuestionMapper],
  useFactory: (
    challenge: SearchResultChallengeMapper,
    expert: SearchResultExpertMapper,
    expertQuestion: SearchResultExpertQuestionMapper,
  ): EntityTypeToSearchResultMapperMap => {
    return {
      challenge,
      expert,
      expertQuestion,
    }
  },
}

import { Inject, Injectable } from '@nestjs/common'
import { ChallengeService } from '@shared/domain/challenge/challenge.service'
import { EntityInstance } from '@shared/domain/entity/domain/entity-instance'
import { ExpertQuestionService } from '@shared/domain/expert-question/service/expert-question.service'
import { ExpertService } from '@shared/domain/expert/services/expert.service'
import { EntityTypeToSearchResultMapperMap } from '@shared/facade/search/domain/entity-type-to-search-result-mapper.map'
import { SearchResultDTO } from '@shared/facade/search/domain/search-result-d-t.o'
import { SearchableEntityType } from '@shared/facade/search/domain/searchable-entity.type'
import { ENTITY_TYPE_TO_RESULT_MAPPER_MAP } from '@shared/facade/search/provider/search-result-mapper.provider'
import { Searchable } from '@shared/interface/searchable'

@Injectable()
export class SearchFacade {
  private readonly entityTypeToSearchableMap: {
    [KEY in SearchableEntityType]: Searchable<EntityInstance<KEY>>
  }

  constructor(
    challengeService: ChallengeService,
    expertService: ExpertService,
    expertQuestionService: ExpertQuestionService,
    @Inject(ENTITY_TYPE_TO_RESULT_MAPPER_MAP)
    private readonly entityTypeToResultMapperMap: EntityTypeToSearchResultMapperMap,
  ) {
    this.entityTypeToSearchableMap = {
      challenge: challengeService,
      expert: expertService,
      expertQuestion: expertQuestionService,
    }
  }

  async search<T extends SearchableEntityType>(
    query: string,
    entityType: T,
  ): Promise<SearchResultDTO[]> {
    const searchable = this.entityTypeToSearchableMap[entityType]
    if (!searchable) {
      throw new Error(`No searchable found for type: ${entityType}`)
    }

    const searchResult = await searchable.search(query)

    return Promise.all(
      searchResult.map((sr) => this.entityTypeToResultMapperMap[entityType].map(sr)),
    )
  }
}

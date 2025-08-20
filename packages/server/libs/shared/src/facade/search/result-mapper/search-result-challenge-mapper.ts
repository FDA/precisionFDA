import { Injectable } from '@nestjs/common'
import { Challenge } from '@shared/domain/challenge/challenge.entity'
import { SearchResultMapper } from '@shared/facade/search/result-mapper/search-result-mapper'

@Injectable()
export class SearchResultChallengeMapper extends SearchResultMapper<'challenge'> {
  async getTitle(challenge: Challenge): Promise<string> {
    return challenge.name
  }

  async getDescription(challenge: Challenge): Promise<string> {
    return challenge.description
  }
}

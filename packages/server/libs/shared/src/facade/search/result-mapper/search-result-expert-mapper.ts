import { Injectable } from '@nestjs/common'
import { Expert } from '@shared/domain/expert/entity/expert.entity'
import { SearchResultMapper } from '@shared/facade/search/result-mapper/search-result-mapper'

@Injectable()
export class SearchResultExpertMapper extends SearchResultMapper<'expert'> {
  protected readonly LINK_SUFFIX = '/blog'

  async getTitle(expert: Expert): Promise<string> {
    const user = await expert.user.load()

    return user.fullName
  }

  async getDescription(expert: Expert): Promise<string> {
    return expert.meta._blog
  }
}

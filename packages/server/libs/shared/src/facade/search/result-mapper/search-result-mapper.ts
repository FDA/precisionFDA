import { Injectable } from '@nestjs/common'
import { EntityInstance } from '@shared/domain/entity/domain/entity-instance'
import { EntityService } from '@shared/domain/entity/entity.service'
import { SearchResultDTO } from '@shared/facade/search/domain/search-result-d-t.o'
import { SearchableEntityType } from '@shared/facade/search/domain/searchable-entity.type'
import { Mappable } from '@shared/interface/mappable'

@Injectable()
export abstract class SearchResultMapper<T extends SearchableEntityType>
  implements Mappable<EntityInstance<T>, Promise<SearchResultDTO>>
{
  protected readonly LINK_SUFFIX: string = null

  constructor(private readonly entityService: EntityService) {}

  async map(entity: EntityInstance<T>): Promise<SearchResultDTO> {
    return {
      title: await this.getTitle(entity),
      description: await this.getDescription(entity),
      link: await this.entityService.getEntityUiLink(entity, this.LINK_SUFFIX),
    }
  }

  abstract getTitle(entity: EntityInstance<T>): Promise<string>

  abstract getDescription(entity: EntityInstance<T>): Promise<string>
}

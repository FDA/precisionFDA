import { Inject, Injectable } from '@nestjs/common'
import { EntityWithProvenanceType } from '@shared/domain/provenance/model/entity-with-provenance.type'
import { ENTITY_TYPE_TO_PARENT_RESOLVER_MAP } from '@shared/domain/provenance/providers/entity-type-to-parent-resolver-map.provider'
import { ArrayUtils } from '@shared/utils/array.utils'
import { EntityProvenance } from '../../model/entity-provenance'
import { EntityProvenanceSourceUnion } from '../../model/entity-provenance-source-union'
import { EntityProvenanceDataService } from './entity-provenance-data.service'

@Injectable()
export class EntityProvenanceDataProviderService {
  constructor(
    @Inject(ENTITY_TYPE_TO_PARENT_RESOLVER_MAP)
    private readonly ENTITY_PARENT_RESOLVER_MAP: {
      [T in EntityWithProvenanceType]: EntityProvenanceDataService<T>
    },
  ) {}

  private async getEntityProvenanceData(
    source: EntityProvenanceSourceUnion,
  ): Promise<EntityProvenance> {
    const dataService: EntityProvenanceDataService<typeof source.type> =
      this.ENTITY_PARENT_RESOLVER_MAP[source.type]

    const result: EntityProvenance = {
      data: await dataService.getData(source.entity),
    }

    const parents = await dataService.getParents(source.entity)
    if (!ArrayUtils.isEmpty(parents)) {
      result.parents = await Promise.all(parents.map((p) => this.getEntityProvenanceData(p)))
    }

    return result
  }

  private async getEntityOutputData(
    source: EntityProvenanceSourceUnion,
  ): Promise<EntityProvenance[]> {
    const dataService: EntityProvenanceDataService<typeof source.type> =
      this.ENTITY_PARENT_RESOLVER_MAP[source.type]

    const children = await dataService.getChildren(source.entity)
    if (!ArrayUtils.isEmpty(children)) {
      return await Promise.all(
        children.map(async (c) => {
          const childDataService: EntityProvenanceDataService<typeof c.type> =
            this.ENTITY_PARENT_RESOLVER_MAP[c.type]
          return { data: await childDataService.getData(c.entity) }
        }),
      )
    }
    return []
  }

  async getData(source: EntityProvenanceSourceUnion): Promise<EntityProvenance> {
    const result = await this.getEntityProvenanceData(source)
    result.children = await this.getEntityOutputData(source)

    return result
  }
}

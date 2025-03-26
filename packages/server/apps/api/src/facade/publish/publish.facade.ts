import { EntityName } from '@mikro-orm/core'
import { Injectable } from '@nestjs/common'
import { DXEntities } from '@shared/domain/entity/domain/dxid'
import { EntityIdentifier } from '@shared/domain/entity/domain/entity-identifier'
import { entityTypeToEntityMap } from '@shared/domain/entity/domain/entity-type-to-entity.map'
import { Uid } from '@shared/domain/entity/domain/uid'
import {
  EntityFetcherService,
  IdEntity,
  UidEntity,
} from '@shared/domain/entity/entity-fetcher.service'
import { EntityProvenance } from '@shared/domain/provenance/model/entity-provenance'
import { EntityProvenanceSourceUnion } from '@shared/domain/provenance/model/entity-provenance-source-union'
import { EntityWithProvenanceType } from '@shared/domain/provenance/model/entity-with-provenance.type'
import { EntityProvenanceService } from '@shared/domain/provenance/service/entity-provenance.service'
import { InvalidStateError, NotFoundError } from '@shared/errors'

@Injectable()
export class PublishApiFacade {
  constructor(
    private readonly entityProvenanceService: EntityProvenanceService,
    private readonly entityFetcherService: EntityFetcherService,
  ) {}
  async getPublishedTreeRoot(identifier: EntityIdentifier, type: EntityWithProvenanceType) {
    const [entityType, id] = identifier.split('-') as [EntityWithProvenanceType, number | string]
    if (!type) {
      type = entityType
    }

    const entity: any = (DXEntities as ReadonlyArray<string>).includes(entityType)
      ? await this.entityFetcherService.getAccessibleByUid(
          entityTypeToEntityMap[type] as EntityName<UidEntity>,
          identifier as Uid,
        )
      : await this.entityFetcherService.getAccessibleById(
          entityTypeToEntityMap[type] as EntityName<IdEntity>,
          Number(id),
        )

    if (!entity) {
      throw new NotFoundError()
    }

    if (!entity.isPublishable()) {
      throw new InvalidStateError('Entity is not publishable')
    }

    const entityProvenanceSource = { type, entity } as EntityProvenanceSourceUnion
    const treeRoot = await this.entityProvenanceService.getEntityProvenance(
      entityProvenanceSource,
      'raw',
    )

    return this.processPublishedTreeRoot(treeRoot)
  }

  private processPublishedTreeRoot(item: EntityProvenance) {
    if (!item.parents || !item.parents.length) {
      return { data: item.data }
    }

    const newParents = []
    for (const parent of item.parents) {
      if (parent.data.type === 'user') {
        continue
      }
      newParents.push(this.processPublishedTreeRoot(parent))
    }

    return {
      data: item.data,
      parents: newParents,
    }
  }
}

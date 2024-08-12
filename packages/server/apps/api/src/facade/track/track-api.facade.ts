import { EntityName } from '@mikro-orm/core'
import { Injectable } from '@nestjs/common'
import { DXEntities } from '@shared/domain/entity/domain/dxid'
import { EntityIdentifier } from '@shared/domain/entity/domain/entity-identifier'
import { entityTypeToEntityMap } from '@shared/domain/entity/domain/entity-type-to-entity.map'
import { EntityType } from '@shared/domain/entity/domain/entity.type'
import { Uid } from '@shared/domain/entity/domain/uid'
import {
  EntityFetcherService,
  IdEntity,
  UidEntity,
} from '@shared/domain/entity/entity-fetcher.service'
import { EntityProvenanceSourceUnion } from '@shared/domain/provenance/model/entity-provenance-source-union'
import { EntityProvenanceService } from '@shared/domain/provenance/service/entity-provenance.service'
import { EntityUtils } from '@shared/utils/entity.utils'

type TrackResourceType = Extract<
  EntityType,
  'app' | 'job' | 'file' | 'dbcluster' | 'comparison' | 'note'
>
type Entity = InstanceType<(typeof entityTypeToEntityMap)[TrackResourceType]>
type DXTrackResourceType = TrackResourceType & (typeof DXEntities)[number]

@Injectable()
export class TrackApiFacade {
  constructor(
    private readonly entityProvenanceService: EntityProvenanceService,
    private readonly entityFetcherService: EntityFetcherService,
  ) {}

  async getProvenance(identifier: EntityIdentifier) {
    const [type, id] = identifier.split('-') as [TrackResourceType, number | string]
    const entity = (DXEntities as ReadonlyArray<string>).includes(type)
      ? await this.entityFetcherService.getAccessibleByUid(
          entityTypeToEntityMap[type] as EntityName<UidEntity>,
          identifier as Uid<DXTrackResourceType>,
        )
      : await this.entityFetcherService.getAccessibleById(
          entityTypeToEntityMap[type] as EntityName<IdEntity>,
          Number(id),
        )
    const name = EntityUtils.getEntityName(entity as Entity)
    const entityProvenanceSource = { type, entity } as EntityProvenanceSourceUnion
    const entityProvenance = await this.entityProvenanceService.getEntityProvenance(
      entityProvenanceSource,
      'svg',
      { omitStyles: false, pixelated: true },
    )
    return { identifier, name, svg: entityProvenance }
  }
}

import { Injectable } from '@nestjs/common'
import { EntityIdentifier } from '@shared/domain/entity/domain/entity-identifier'
import { entityTypeToEntityMap } from '@shared/domain/entity/domain/entity-type-to-entity.map'
import { EntityType } from '@shared/domain/entity/domain/entity.type'
import { EntityProvenanceSourceUnion } from '@shared/domain/provenance/model/entity-provenance-source-union'
import { EntityProvenanceService } from '@shared/domain/provenance/service/entity-provenance.service'
import { EntityUtils } from '@shared/utils/entity.utils'
import { InvalidStateError, NotFoundError } from '@shared/errors'
import { AppRepository } from '@shared/domain/app/app.repository'
import { JobRepository } from '@shared/domain/job/job.repository'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import { NoteRepository } from '@shared/domain/note/note.repository'
import { Uid } from '@shared/domain/entity/domain/uid'

type TrackResourceType = Extract<
  EntityType,
  'app' | 'job' | 'file' | 'dbcluster' | 'comparison' | 'note'
>
type Entity = InstanceType<(typeof entityTypeToEntityMap)[TrackResourceType]>

@Injectable()
export class TrackApiFacade {
  constructor(
    private readonly entityProvenanceService: EntityProvenanceService,
    private readonly appRepository: AppRepository,
    private readonly jobRepository: JobRepository,
    private readonly nodeRepository: NodeRepository,
    private readonly noteRepository: NoteRepository,
  ) {}

  async getProvenance(identifier: EntityIdentifier) {
    const [type, id] = identifier.split('-') as [TrackResourceType, number | string]

    let entity = null

    switch (type) {
      case 'app':
        entity = await this.appRepository.findAccessibleOne({ uid: identifier as Uid<'app'> })
        break
      case 'job':
        entity = await this.jobRepository.findAccessibleOne({ uid: identifier as Uid<'job'> })
        break
      case 'file':
        entity = await this.nodeRepository.findAccessibleOne({ uid: identifier as Uid<'file'> })
        break
      case 'note':
        entity = await this.noteRepository.findAccessibleOne({ id: Number(id) })
        break
      case 'dbcluster':
      case 'comparison':
      default:
        throw new InvalidStateError('Invalid entity type')
    }

    if (!entity) {
      throw new NotFoundError()
    }

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

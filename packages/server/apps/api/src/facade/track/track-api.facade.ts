import { Injectable } from '@nestjs/common'
import { AppRepository } from '@shared/domain/app/app.repository'
import { ComparisonRepository } from '@shared/domain/comparison/comparison.repository'
import { DbClusterRepository } from '@shared/domain/db-cluster/db-cluster.repository'
import { entityTypeToEntityMap } from '@shared/domain/entity/domain/entity-type-to-entity.map'
import { EntityType } from '@shared/domain/entity/domain/entity.type'
import { EntityIdentifier } from '@shared/domain/entity/domain/entity-identifier'
import { Uid } from '@shared/domain/entity/domain/uid'
import { JobRepository } from '@shared/domain/job/job.repository'
import { NoteRepository } from '@shared/domain/note/note.repository'
import { EntityProvenanceSource } from '@shared/domain/provenance/model/entity-provenance-source'
import { EntityProvenanceSourceUnion } from '@shared/domain/provenance/model/entity-provenance-source-union'
import { EntityProvenanceService } from '@shared/domain/provenance/service/entity-provenance.service'
import { Node } from '@shared/domain/user-file/node.entity'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import { FILE_STI_TYPE } from '@shared/domain/user-file/user-file.types'
import { InvalidStateError, NotFoundError } from '@shared/errors'
import { EntityUtils } from '@shared/utils/entity.utils'
import { TrackProvenanceDTO } from './model/track-provenance.dto'

type TrackResourceType = Extract<EntityType, 'app' | 'job' | 'file' | 'dbcluster' | 'comparison' | 'note'>
type TrackEntity = InstanceType<(typeof entityTypeToEntityMap)[TrackResourceType]>
type TrackProvenanceSource = {
  [K in TrackResourceType]: EntityProvenanceSource<K>
}[TrackResourceType]

const isTrackFileEntity = (entity: Node | null): entity is InstanceType<(typeof entityTypeToEntityMap)['file']> =>
  entity?.stiType === FILE_STI_TYPE.USERFILE

@Injectable()
export class TrackApiFacade {
  constructor(
    private readonly entityProvenanceService: EntityProvenanceService,
    private readonly appRepository: AppRepository,
    private readonly jobRepository: JobRepository,
    private readonly nodeRepository: NodeRepository,
    private readonly noteRepository: NoteRepository,
    private readonly dbClusterRepository: DbClusterRepository,
    private readonly comparisonRepository: ComparisonRepository,
  ) {}

  async getProvenance(identifier: EntityIdentifier): Promise<TrackProvenanceDTO> {
    const [type, id] = identifier.split('-') as [TrackResourceType, number | string]

    let entityProvenanceSource: TrackProvenanceSource | null = null

    switch (type) {
      case 'app': {
        const entity: TrackEntity | null = await this.appRepository.findAccessibleOne({ uid: identifier as Uid<'app'> })
        if (entity) {
          entityProvenanceSource = { type, entity }
        }
        break
      }
      case 'job': {
        const entity: TrackEntity | null = await this.jobRepository.findAccessibleOne({ uid: identifier as Uid<'job'> })
        if (entity) {
          entityProvenanceSource = { type, entity }
        }
        break
      }
      case 'file': {
        const entity = await this.nodeRepository.findAccessibleOne({ uid: identifier as Uid<'file'> })
        if (isTrackFileEntity(entity)) {
          entityProvenanceSource = { type, entity }
        }
        break
      }
      case 'dbcluster': {
        const entity: TrackEntity | null = await this.dbClusterRepository.findAccessibleOne({
          uid: identifier as Uid<'dbcluster'>,
        })
        if (entity) {
          entityProvenanceSource = { type, entity }
        }
        break
      }
      case 'note': {
        const entity: TrackEntity | null = await this.noteRepository.findAccessibleOne({ id: Number(id) })
        if (entity) {
          entityProvenanceSource = { type, entity }
        }
        break
      }
      case 'comparison': {
        const entity: TrackEntity | null = await this.comparisonRepository.findAccessibleOne({ id: Number(id) })
        if (entity) {
          entityProvenanceSource = { type, entity }
        }
        break
      }
      default:
        throw new InvalidStateError('Invalid entity type')
    }

    if (!entityProvenanceSource) {
      throw new NotFoundError()
    }

    const name: string = EntityUtils.getEntityName(entityProvenanceSource.entity)
    const provenanceSource: EntityProvenanceSourceUnion = entityProvenanceSource
    const entityProvenance = await this.entityProvenanceService.getEntityProvenance(provenanceSource, 'svg', {
      omitStyles: false,
      pixelated: true,
    })
    return {
      identifier,
      name,
      svg: entityProvenance,
    }
  }
}

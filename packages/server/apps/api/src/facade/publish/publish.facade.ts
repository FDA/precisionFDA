import { Injectable } from '@nestjs/common'
import { AppRepository } from '@shared/domain/app/app.repository'
import { ComparisonRepository } from '@shared/domain/comparison/comparison.repository'
import { EntityIdentifier } from '@shared/domain/entity/domain/entity-identifier'
import { Uid } from '@shared/domain/entity/domain/uid'
import { JobRepository } from '@shared/domain/job/job.repository'
import { NoteRepository } from '@shared/domain/note/note.repository'
import { EntityProvenanceSourceUnion } from '@shared/domain/provenance/model/entity-provenance-source-union'
import { EntityWithProvenanceType } from '@shared/domain/provenance/model/entity-with-provenance.type'
import { EntityProvenanceService } from '@shared/domain/provenance/service/entity-provenance.service'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import { InvalidStateError, NotFoundError } from '@shared/errors'
import { PublishTreeRootDTO } from './model/publish-tree-root.dto'

@Injectable()
export class PublishApiFacade {
  constructor(
    private readonly entityProvenanceService: EntityProvenanceService,
    private readonly appRepository: AppRepository,
    private readonly jobRepository: JobRepository,
    private readonly nodeRepository: NodeRepository,
    private readonly noteRepository: NoteRepository,
    private readonly comparisonRepository: ComparisonRepository,
  ) {}

  async getPublishedTreeRoot(
    identifier: EntityIdentifier,
    type: EntityWithProvenanceType,
  ): Promise<PublishTreeRootDTO> {
    let entity = null

    switch (type) {
      case 'app':
        entity = await this.appRepository.findAccessibleOne({ uid: identifier as Uid<'app'> })
        break
      case 'job':
        entity = await this.jobRepository.findAccessibleOne({ uid: identifier as Uid<'job'> })
        break
      case 'file':
      case 'asset':
        entity = await this.nodeRepository.findAccessibleOne({ uid: identifier as Uid<'file'> })
        break
      case 'folder': {
        const [, id] = identifier.split('-')
        entity = await this.nodeRepository.findAccessibleOne({
          id: Number(id),
        })
        break
      }
      case 'note': {
        const [, id] = identifier.split('-')
        entity = await this.noteRepository.findAccessibleOne({ id: Number(id) })
        break
      }
      case 'comparison': {
        const [, id] = identifier.split('-')
        entity = await this.comparisonRepository.findAccessibleOne({ id: Number(id) })
        break
      }
      default:
        throw new InvalidStateError('Invalid entity type')
    }

    if (!entity) {
      throw new NotFoundError()
    }

    if (!entity.isPublishable()) {
      throw new InvalidStateError('Entity is not publishable')
    }

    const entityProvenanceSource = { type, entity } as EntityProvenanceSourceUnion
    const treeRoot = await this.entityProvenanceService.getEntityProvenance(entityProvenanceSource, 'raw')

    return PublishTreeRootDTO.fromProvenance(treeRoot)
  }
}

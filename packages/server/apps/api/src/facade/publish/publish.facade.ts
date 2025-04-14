import { Injectable } from '@nestjs/common'
import { EntityIdentifier } from '@shared/domain/entity/domain/entity-identifier'
import { EntityProvenance } from '@shared/domain/provenance/model/entity-provenance'
import { EntityProvenanceSourceUnion } from '@shared/domain/provenance/model/entity-provenance-source-union'
import { EntityWithProvenanceType } from '@shared/domain/provenance/model/entity-with-provenance.type'
import { EntityProvenanceService } from '@shared/domain/provenance/service/entity-provenance.service'
import { InvalidStateError, NotFoundError } from '@shared/errors'
import { AppRepository } from '@shared/domain/app/app.repository'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import { JobRepository } from '@shared/domain/job/job.repository'
import { NoteRepository } from '@shared/domain/note/note.repository'
import { Uid } from '@shared/domain/entity/domain/uid'

@Injectable()
export class PublishApiFacade {
  constructor(
    private readonly entityProvenanceService: EntityProvenanceService,
    private readonly appRepository: AppRepository,
    private readonly jobRepository: JobRepository,
    private readonly nodeRepository: NodeRepository,
    private readonly noteRepository: NoteRepository,
  ) {}
  async getPublishedTreeRoot(identifier: EntityIdentifier, type: EntityWithProvenanceType) {
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
      case 'note':
        const [entityType, id] = identifier.split('-')
        entity = await this.noteRepository.findAccessibleOne({ id: Number(id) })
        break
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

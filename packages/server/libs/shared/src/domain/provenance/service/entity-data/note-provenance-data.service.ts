import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { App } from '@shared/domain/app/app.entity'
import { ItemType } from '@shared/domain/attachment/attachment.entity'
import { Comparison } from '@shared/domain/comparison/comparison.entity'
import { EntityService } from '@shared/domain/entity/entity.service'
import { Job } from '@shared/domain/job/job.entity'
import { Note } from '@shared/domain/note/note.entity'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { Node } from '@shared/domain/user-file/node.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { FILE_STI_TYPE } from '@shared/domain/user-file/user-file.types'
import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'
import { EntityProvenanceSourceUnion } from '../../model/entity-provenance-source-union'
import { EntityProvenanceDataService } from './entity-provenance-data.service'

@Injectable()
export class NoteProvenanceDataService extends EntityProvenanceDataService<'note'> {
  protected type = 'note' as const

  private readonly attachmentTypeToRepositoryMap

  constructor(em: SqlEntityManager, entityService: EntityService) {
    super(entityService)
    this.attachmentTypeToRepositoryMap = {
      Node: em.getRepository(Node),
      Asset: em.getRepository(Asset),
      UserFile: em.getRepository(UserFile),
      Job: em.getRepository(Job),
      App: em.getRepository(App),
      Workflow: em.getRepository(Workflow),
      Comparison: em.getRepository(Comparison),
    } satisfies Record<ItemType, object>
  }

  protected getIdentifier(note: Note): string {
    return String(note.id)
  }

  private getSourceType(attachmentType: ItemType): EntityProvenanceSourceUnion['type'] {
    if (attachmentType === FILE_STI_TYPE.USERFILE) return 'file'
    return attachmentType.toLowerCase() as EntityProvenanceSourceUnion['type']
  }

  async getParents(note: Note): Promise<EntityProvenanceSourceUnion[]> {
    const attachments = await note.attachments.loadItems()
    const entities: EntityProvenanceSourceUnion[] = []
    for (let attachment of attachments) {
      const entity = await this.attachmentTypeToRepositoryMap[attachment.itemType].findOneOrFail({
        id: attachment.itemId,
      })
      let sourceType = attachment.itemType
      if (sourceType === 'Node') {
        sourceType = entity.stiType
      }
      entities.push({
        type: this.getSourceType(sourceType),
        entity,
      })
    }
    return entities
  }

  async getChildren(): Promise<EntityProvenanceSourceUnion[]> {
    return []
  }
}

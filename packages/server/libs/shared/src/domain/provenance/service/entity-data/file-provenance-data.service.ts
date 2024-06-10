import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { Comparison } from '@shared/domain/comparison/comparison.entity'
import { EntityType } from '@shared/domain/entity/domain/entity.type'
import { EntityService } from '@shared/domain/entity/entity.service'
import { Job } from '@shared/domain/job/job.entity'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { PARENT_TYPE } from '../../../user-file/user-file.types'
import { EntityProvenanceSourceUnion } from '../../model/entity-provenance-source-union'
import { EntityProvenanceDataService } from './entity-provenance-data.service'

@Injectable()
export class FileProvenanceDataService extends EntityProvenanceDataService<'file'> {
  protected type = 'file' as const

  private PARENT_TYPE_TO_ENTITY_TYPE_MAP: Record<PARENT_TYPE, EntityType> = {
    [PARENT_TYPE.USER]: 'user',
    [PARENT_TYPE.COMPARISON]: 'comparison',
    [PARENT_TYPE.JOB]: 'job',
    [PARENT_TYPE.ASSET]: 'asset',
    [PARENT_TYPE.NODE]: 'file',
  }

  private readonly parentTypeToRepositoryMap

  constructor(em: SqlEntityManager, entityService: EntityService) {
    super(entityService)
    this.parentTypeToRepositoryMap = {
      [PARENT_TYPE.USER]: em.getRepository(User),
      [PARENT_TYPE.COMPARISON]: em.getRepository(Comparison),
      [PARENT_TYPE.JOB]: em.getRepository(Job),
      [PARENT_TYPE.NODE]: em.getRepository(UserFile),
      [PARENT_TYPE.ASSET]: em.getRepository(Asset),
    } satisfies Record<PARENT_TYPE, object>
  }

  protected getIdentifier(file: UserFile): string {
    return file.uid
  }

  async getParents(file: UserFile): Promise<EntityProvenanceSourceUnion[]> {
    if (file.parentId == null || !file.parentType) {
      return []
    }

    const parent = await this.findParentEntity(file.parentId, file.parentType)

    if (parent == null) {
      return []
    }

    return [
      {
        type: this.PARENT_TYPE_TO_ENTITY_TYPE_MAP[file.parentType],
        entity: parent,
      } as EntityProvenanceSourceUnion,
    ]
  }

  async getChildren(): Promise<EntityProvenanceSourceUnion[]> {
    return []
  }

  private async findParentEntity<T extends PARENT_TYPE>(parentId: number, parentType: T) {
    const repo = this.parentTypeToRepositoryMap[parentType]

    return repo.findOne(parentId)
  }
}

import { SqlEntityManager } from '@mikro-orm/mysql'
import { config } from '../../../..'
import { Comparison } from '../../../comparison'
import { EntityType } from '../../../entity'
import { Job } from '../../../job'
import { User } from '../../../user'
import { Asset, UserFile } from '../../../user-file'
import { PARENT_TYPE } from '../../../user-file/user-file.types'
import { EntityProvenanceData } from '../../model/entity-provenance-data'
import { EntityProvenanceSourceUnion } from '../../model/entity-provenance-source-union'
import { EntityProvenanceDataService } from './entity-provenance-data.service'

export class FileProvenanceDataService implements EntityProvenanceDataService<'file'> {
  private PARENT_TYPE_TO_ENTITY_TYPE_MAP: Record<PARENT_TYPE, EntityType> = {
    [PARENT_TYPE.USER]: 'user',
    [PARENT_TYPE.COMPARISON]: 'comparison',
    [PARENT_TYPE.JOB]: 'job',
    [PARENT_TYPE.ASSET]: 'asset',
    [PARENT_TYPE.NODE]: 'file',
  }

  private readonly parentTypeToRepositoryMap

  constructor(em: SqlEntityManager) {
    this.parentTypeToRepositoryMap = {
      [PARENT_TYPE.USER]: em.getRepository(User),
      [PARENT_TYPE.COMPARISON]: em.getRepository(Comparison),
      [PARENT_TYPE.JOB]: em.getRepository(Job),
      [PARENT_TYPE.NODE]: em.getRepository(UserFile),
      [PARENT_TYPE.ASSET]: em.getRepository(Asset),
    } satisfies Record<PARENT_TYPE, object>
  }

  getData(file: UserFile): EntityProvenanceData<'file'> {
    return {
      type: 'file',
      url: `${config.api.railsHost}/home/files/${file.uid}`,
      title: file.name,
    }
  }

  async getParents(file: UserFile): Promise<EntityProvenanceSourceUnion[]> {
    if (file.parentId == null || !file.parentType) {
      return []
    }

    const parent = await this.findParentEntity(file.parentId, file.parentType)

    if (parent == null) {
      return []
    }

    return [{
      type: this.PARENT_TYPE_TO_ENTITY_TYPE_MAP[file.parentType],
      entity: parent,
    } as EntityProvenanceSourceUnion]
  }

  private async findParentEntity<T extends PARENT_TYPE>(parentId: number, parentType: T) {
    const repo = this.parentTypeToRepositoryMap[parentType]

    return repo.findOne(parentId)
  }
}

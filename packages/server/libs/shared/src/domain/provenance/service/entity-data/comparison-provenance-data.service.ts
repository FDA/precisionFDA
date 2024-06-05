import { Injectable } from '@nestjs/common'
import { COMPARISON_STATE, Comparison } from '@shared/domain/comparison/comparison.entity'
import { EntityProvenanceSourceUnion } from '../../model/entity-provenance-source-union'
import { EntityProvenanceDataService } from './entity-provenance-data.service'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { EntityService } from '@shared/domain/entity/entity.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { PARENT_TYPE } from '@shared/domain/user-file/user-file.types'

@Injectable()
export class ComparisonProvenanceDataService extends EntityProvenanceDataService<'comparison'> {
  protected type = 'comparison' as const

  private readonly fileRepository

  constructor(em: SqlEntityManager, entityService: EntityService) {
    super(entityService)
    this.fileRepository = em.getRepository(UserFile)
  }

  protected getIdentifier(comparison: Comparison): string {
    return String(comparison.id)
  }

  async getParents(comparison: Comparison): Promise<EntityProvenanceSourceUnion[]> {
    const files = await comparison.inputFiles.loadItems()

    return files.map((f) => ({ type: 'file', entity: f }))
  }

  async getChildren(comparison: Comparison): Promise<EntityProvenanceSourceUnion[]> {
    if (comparison.state !== COMPARISON_STATE.DONE) {
      return []
    }
    const outputFiles = await this.fileRepository.find({
      parentType: PARENT_TYPE.COMPARISON,
      parentId: comparison.id,
    })

    return outputFiles.map((f) => ({ type: 'file', entity: f }))
  }
}

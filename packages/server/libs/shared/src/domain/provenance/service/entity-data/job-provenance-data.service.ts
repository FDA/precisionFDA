import { Injectable } from '@nestjs/common'
import { Job } from '@shared/domain/job/job.entity'
import { EntityProvenanceSourceUnion } from '../../model/entity-provenance-source-union'
import { EntityProvenanceDataService } from './entity-provenance-data.service'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { EntityService } from '@shared/domain/entity/entity.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { JOB_STATE } from '@shared/domain/job/job.enum'
import { PARENT_TYPE } from '@shared/domain/user-file/user-file.types'

@Injectable()
export class JobProvenanceDataService extends EntityProvenanceDataService<'job'> {
  protected type = 'job' as const

  private readonly fileRepository

  constructor(em: SqlEntityManager, entityService: EntityService) {
    super(entityService)
    this.fileRepository = em.getRepository(UserFile)
  }

  protected getIdentifier(job: Job): string {
    return job.uid
  }

  async getParents(job: Job): Promise<EntityProvenanceSourceUnion[]> {
    const parents: EntityProvenanceSourceUnion[] = []

    const inputFiles = await job.inputFiles.loadItems()
    inputFiles.forEach((file) => parents.push({ type: 'file', entity: file }))

    const app = await job.app?.load()

    if (app) {
      parents.push({ type: 'app', entity: app })
    }

    return parents
  }

  async getChildren(job: Job): Promise<EntityProvenanceSourceUnion[]> {
    if (job.state !== JOB_STATE.DONE) {
      return []
    }
    const outputFiles = await this.fileRepository.find({
      parentType: PARENT_TYPE.JOB,
      parentId: job.id,
    })
    return outputFiles.map((f) => ({ type: 'file', entity: f }))
  }
}

import { Injectable } from '@nestjs/common'
import { Job } from '@shared/domain/job/job.entity'
import { EntityProvenanceSourceUnion } from '../../model/entity-provenance-source-union'
import { EntityProvenanceDataService } from './entity-provenance-data.service'

@Injectable()
export class JobProvenanceDataService extends EntityProvenanceDataService<'job'> {
  protected type = 'job' as const

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
}

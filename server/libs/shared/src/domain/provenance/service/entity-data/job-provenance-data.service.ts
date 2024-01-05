import { Injectable } from '@nestjs/common'
import { config } from '@shared'
import { Job } from '../../../job'
import { EntityProvenanceData } from '../../model/entity-provenance-data'
import { EntityProvenanceSourceUnion } from '../../model/entity-provenance-source-union'
import { EntityProvenanceDataService } from './entity-provenance-data.service'

@Injectable()
export class JobProvenanceDataService implements EntityProvenanceDataService<'job'> {
  getData(job: Job): EntityProvenanceData<'job'> {
    return {
      type: 'job',
      url: `${config.api.railsHost}/home/executions/${job.uid}`,
      title: job.name,
    }
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
}

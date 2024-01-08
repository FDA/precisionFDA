import { Injectable } from '@nestjs/common'
import { config } from '@shared/config'
import { App } from '@shared/domain/app/app.entity'
import { EntityProvenanceData } from '../../model/entity-provenance-data'
import { EntityProvenanceSourceUnion } from '../../model/entity-provenance-source-union'
import { EntityProvenanceDataService } from './entity-provenance-data.service'

@Injectable()
export class AppProvenanceDataService implements EntityProvenanceDataService<'app'> {
  getData(app: App): EntityProvenanceData<'app'> {
    let title = app.title

    if (app.revision != null) {
      title += ` (revision ${app.revision})`
    }

    return {
      type: 'app',
      url: `${config.api.railsHost}/home/apps/${app.uid}`,
      title,
    }
  }

  async getParents(app: App): Promise<EntityProvenanceSourceUnion[]> {
    const assets = await app.assets.loadItems()

    return assets.map((asset) => ({
      type: 'asset',
      entity: asset,
    }))
  }
}

import { config } from '../../../..'
import { App } from '../../../app'
import { EntityProvenanceData } from '../../model/entity-provenance-data'
import { EntityProvenanceSourceUnion } from '../../model/entity-provenance-source-union'
import { EntityProvenanceDataService } from './entity-provenance-data.service'

export class AppProvenanceDataService implements EntityProvenanceDataService<'app'> {
  getData(app: App): EntityProvenanceData<'app'> {
    return {
      type: 'app',
      url: `${config.api.railsHost}/home/apps/${app.uid}`,
      title: app.title,
    }
  }

  async getParents(app: App): Promise<EntityProvenanceSourceUnion[]> {
    const assets = await app.assets.loadItems()

    return assets.map(asset => ({
      type: 'asset',
      entity: asset,
    }))
  }
}

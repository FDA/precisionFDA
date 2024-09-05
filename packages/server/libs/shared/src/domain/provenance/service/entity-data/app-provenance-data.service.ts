import { Injectable } from '@nestjs/common'
import { App } from '@shared/domain/app/app.entity'
import { EntityProvenanceSourceUnion } from '../../model/entity-provenance-source-union'
import { EntityProvenanceDataService } from './entity-provenance-data.service'

@Injectable()
export class AppProvenanceDataService extends EntityProvenanceDataService<'app'> {
  protected type = 'app' as const

  protected getIdentifier(app: App): string {
    return app.uid
  }

  protected getTitle(app: App): string {
    const title = super.getTitle(app)

    if (app.revision == null) {
      return title
    }

    return `${title} (revision ${app.revision})`
  }

  async getParents(app: App): Promise<EntityProvenanceSourceUnion[]> {
    const assets = await app.assets.loadItems()

    return assets.map((asset) => ({
      type: 'asset',
      entity: asset,
    }))
  }

  async getChildren(source: App): Promise<EntityProvenanceSourceUnion[]> {
    return []
  }
}

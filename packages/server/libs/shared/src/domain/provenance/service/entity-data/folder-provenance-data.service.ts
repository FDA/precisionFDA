import { Injectable } from '@nestjs/common'
import { EntityProvenanceDataService } from '@shared/domain/provenance/service/entity-data/entity-provenance-data.service'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { EntityProvenanceSourceUnion } from '../../model/entity-provenance-source-union'

@Injectable()
export class FolderProvenanceDataService extends EntityProvenanceDataService<'folder'> {
  protected type = 'folder' as const
  protected getIdentifier(source: Folder): string {
    return String(source.id)
  }
  async getParents(): Promise<EntityProvenanceSourceUnion[]> {
    return []
  }
  async getChildren(): Promise<EntityProvenanceSourceUnion[]> {
    return []
  }
}

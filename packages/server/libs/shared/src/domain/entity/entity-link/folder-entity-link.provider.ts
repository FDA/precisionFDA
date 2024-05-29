import { Injectable } from '@nestjs/common'
import { EntityLinkProvider } from '@shared/domain/entity/entity-link/entity-link.provider'
import { getIdFromScopeName } from '@shared/domain/space/space.helper'
import { Folder } from '@shared/domain/user-file/folder.entity'

@Injectable()
export class FolderEntityLinkProvider extends EntityLinkProvider<'folder'> {
  protected async getRelativeLink(folder: Folder) {
    const scope = folder.scope

    if (this.MY_HOME_SCOPES.includes(scope)) {
      return this.getHomeLink(folder)
    }

    return this.getSpaceLink(folder, getIdFromScopeName(scope))
  }

  private getHomeLink(folder: Folder) {
    return `/home/${this.getUrlSegment(folder)}` as const
  }

  private getSpaceLink(folder: Folder, spaceId: number) {
    return `/spaces/${spaceId}/${this.getUrlSegment(folder)}` as const
  }

  private getUrlSegment(folder: Folder): string {
    return 'files?folder_id=' + folder.id
  }
}

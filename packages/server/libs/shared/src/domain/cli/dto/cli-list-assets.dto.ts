import { Uid } from '@shared/domain/entity/domain/uid'
import { Asset } from '@shared/domain/user-file/asset.entity'

export class CliListAssetDTO {
  id: number
  uid: Uid<'file'>
  name: string
  type: string
  state: string
  addedBy: string
  createdAt: Date
  fileSize: number | null
  scope: string
  locked: boolean
  archiveContent: string[]
  properties: Record<string, string>

  static fromEntity(asset: Asset): CliListAssetDTO {
    const props: Record<string, string> = {}
    asset.properties.getItems().forEach(p => {
      props[p.propertyName] = p.propertyValue
    })

    return {
      id: asset.id,
      uid: asset.uid,
      name: asset.name,
      type: asset.stiType,
      state: asset.state,
      addedBy: asset.user.getEntity().fullName,
      createdAt: asset.createdAt,
      fileSize: asset.fileSize ?? null,
      scope: asset.scope,
      locked: asset.locked ?? false,
      archiveContent: asset.archiveEntries.getItems().map(e => e.path),
      properties: props,
    }
  }
}

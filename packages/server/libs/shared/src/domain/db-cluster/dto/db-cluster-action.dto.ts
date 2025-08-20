import { IsValidDxid } from '@shared/domain/entity/constraint/is-dxid-valid.constraint'
import { DxId } from '@shared/domain/entity/domain/dxid'

export class DbClusterActionDTO {
  @IsValidDxid({ entityType: 'dbcluster', each: true })
  dxids: DxId<'dbcluster'>[]
}

import { PlatformIOType } from '../../types/common'
import { DxId } from '../entity/domain/dxid'

export type JobInput = Record<string, PlatformIOType>

export type Provenance = {
  [k: string]: {
    app_dxid: DxId<'app'>
    app_id: number
    inputs: JobInput
  }
}

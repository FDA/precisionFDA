import { FILE_STI_TYPE } from '../../user-file.types'

export abstract class NodeDTO {
  abstract readonly stiType: FILE_STI_TYPE
}

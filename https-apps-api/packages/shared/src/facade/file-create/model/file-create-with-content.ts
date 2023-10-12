import { FileCreate } from './file-create'

export interface FileCreateWithContent extends FileCreate {
  content: string
}

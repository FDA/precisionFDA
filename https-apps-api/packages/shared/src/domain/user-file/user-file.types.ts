import { IdentifiedReference } from "@mikro-orm/core"
import { User } from "../user/user.entity"

// File state from the platform
enum FILE_STATE_DX {
  ABANDONED = 'abandoned',  // See PFDA-685
  CLOSING = 'closing',
  CLOSED = 'closed',
  OPEN = 'open',
}

enum FILE_STATE_PFDA {
  // pFDA internal state, used for files that are being copied by a worker.
  COPYING = 'copying',
  REMOVING = 'removing',
}

type FILE_STATE = FILE_STATE_DX | FILE_STATE_PFDA

enum FILE_ORIGIN_TYPE {
  REGULAR = 0,
  HTTPS = 1,
}

enum FILE_STI_TYPE {
  USERFILE = 'UserFile',
  ASSET = 'Asset',
  FOLDER = 'Folder',
}

enum PARENT_TYPE {
  USER = 'User',
  JOB = 'Job',
  ASSET = 'Asset',
  COMPARISON = 'Comparison',
}

// IFileOrAsset is for methods that operate on UserFiles and Assets
// but not all nodes (e.g. not Folders)
interface IFileOrAsset {
  id: number
  dxid: string
  uid: string
  project: string
  name: string
  state: string
  fileSize?: number
  user: IdentifiedReference<User>
  isFile: boolean
  isAsset: boolean
  isCreatedByChallengeBot: () => boolean
}

// ITrackable represents an object whose provenance can be tracked
// This is applicable to UserFile, Folder and Assets
interface ITrackable {
  parentId: number
  parentType: PARENT_TYPE
}

export {
  FILE_STATE,
  FILE_STATE_PFDA,
  FILE_STATE_DX,
  FILE_ORIGIN_TYPE,
  PARENT_TYPE,
  FILE_STI_TYPE,
  IFileOrAsset,
  ITrackable,
}

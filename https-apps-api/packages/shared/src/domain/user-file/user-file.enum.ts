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

export { FILE_STATE, FILE_STATE_PFDA, FILE_STATE_DX, FILE_ORIGIN_TYPE, PARENT_TYPE, FILE_STI_TYPE }

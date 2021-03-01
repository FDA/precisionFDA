enum FILE_STATE {
  ABANDONED = 'abandoned',
  CLOSING = 'closing',
  CLOSED = 'closed',
  OPEN = 'open',
}

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

export { FILE_STATE, FILE_ORIGIN_TYPE, PARENT_TYPE, FILE_STI_TYPE }

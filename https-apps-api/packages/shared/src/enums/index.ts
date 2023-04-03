enum ENVS {
  LOCAL = 'local',
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

enum STATIC_SCOPE {
  PRIVATE = 'private',
  PUBLIC = 'public',
}

type Scope = STATIC_SCOPE & { [k: string]: string }

enum HOME_SCOPE {
  ME = 'me',
  FEATURED = 'featured',
  EVERYBODY = 'everybody',
}

enum NOTIFICATION_ACTION {
  NODES_REMOVED = 'NODES_REMOVED',
  NODES_COPIED = 'NODES_COPIED',
  SPACE_ACTIVATED = 'SPACE_ACTIVATED',
}

enum SEVERITY {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
}

export { ENVS, STATIC_SCOPE, Scope, HOME_SCOPE, NOTIFICATION_ACTION, SEVERITY }

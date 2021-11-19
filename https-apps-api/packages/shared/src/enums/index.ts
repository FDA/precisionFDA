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

export { ENVS, STATIC_SCOPE, Scope }

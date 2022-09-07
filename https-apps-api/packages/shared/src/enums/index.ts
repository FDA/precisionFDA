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

export { ENVS, STATIC_SCOPE, Scope, HOME_SCOPE }

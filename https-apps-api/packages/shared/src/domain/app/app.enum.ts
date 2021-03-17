enum ENTITY_TYPE {
  NORMAL = 0,
  HTTPS = 1,
}

// DEPRECATED
enum APP_HTTPS_SUBTYPE {
  JUPYTER = 'jupyter',
  TTYD = 'ttyd',
  SHINY = 'r_shiny',
  // out of scope
  // CLOUDWS = 'cloud_workstation',
  // CUSTOM = 'custom',
}

export { ENTITY_TYPE, APP_HTTPS_SUBTYPE }

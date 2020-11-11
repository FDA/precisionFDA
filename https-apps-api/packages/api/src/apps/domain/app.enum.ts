enum APP_TYPE {
  HTTPS = 'https',
  // all of the old "normal apps"
  NORMAL = 'normal',
}

enum APP_HTTPS_SUBTYPE {
  JUPYTER = 'jupyter',
  TTYD = 'ttyd',
  CLOUDWS = 'cloud_workstation',
  CUSTOM = 'custom',
}

export { APP_TYPE, APP_HTTPS_SUBTYPE }

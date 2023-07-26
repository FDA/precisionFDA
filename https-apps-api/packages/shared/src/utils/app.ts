import { config, errors } from '@pfda/https-apps-shared'

export const codeRemap = (code: string): string => {
  if (!config.api.appKit) {
    throw new errors.ServiceError('AppKit environment variable is not configured', {})
  }
  return `
      dx cat ${config.api.appKit} | tar -z -x -C / --no-same-owner --no-same-permissions -f -
      source /usr/lib/app-prologue
      ${code}
      { set +x; } 2>/dev/null
      source /usr/lib/app-epilogue
  `
}

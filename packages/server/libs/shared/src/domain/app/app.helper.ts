import { ENTITY_TYPE } from './app.enum'
import { AppInputSpecItem, AppSpecItem, PlatformSpec } from './app.input'

export const APP_CLI_CODE = '__pfda_cli_code'
export const APP_SERVER_URL = '__pfda_server_url'
export const APPKIT_LATEST_VERSION = '1.3.0'

export const constructDxid = (username: string, appName: string, scope?: string): string => {
  return `app-${constructDxName(username, appName, scope)}`
}

export const constructDxName = (username: string, appName: string, scope?: string): string => {
  return `${username}-${appName}-${scope}`
}

export const getEntityType = (entityType: string): ENTITY_TYPE => {
  if (entityType && entityType === 'https') {
    return ENTITY_TYPE.HTTPS
  } else {
    return ENTITY_TYPE.NORMAL
  }
}

/**
 * Some attributes are only for pfda and not acceptable by platform.
 * @param pfdaSpecs
 * @private
 */
export const remapPfdaSpecToPlatformSpec = (pfdaSpecs: AppSpecItem[]): PlatformSpec[] => {
  return pfdaSpecs.map(pfdaSpec => {
    return {
      class: pfdaSpec.class,
      help: pfdaSpec.help,
      label: pfdaSpec.label,
      name: pfdaSpec.name,
      optional: pfdaSpec.optional,
    } as PlatformSpec
  })
}

export const stripChoices = (spec: AppInputSpecItem[]): AppInputSpecItem[] => {
  return spec.map(s => {
    if (s.choices && s.choices.length === 0) {
      delete s.choices
    }
    return s
  })
}

export const getCLIKeyInputSpec = (): AppInputSpecItem[] => {
  return [
    {
      class: 'string',
      help: 'PFDA CLI exchange token',
      label: APP_CLI_CODE,
      name: APP_CLI_CODE,
      optional: true,
    },
    {
      class: 'string',
      help: 'PFDA server',
      label: APP_SERVER_URL,
      name: APP_SERVER_URL,
      optional: true,
    },
  ]
}

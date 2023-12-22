import { SqlEntityManager } from '@mikro-orm/mysql'
import { Controller, Get, Headers, Inject, Logger } from '@nestjs/common'
import type { client } from '@shared'
import {
  config,
  dataPortal,
  DEPRECATED_SQL_ENTITY_MANAGER_TOKEN,
  errors,
  UserContext,
} from '@shared'
import { isRequestFromAuthenticatedUser, isRequestFromFdaSubnet } from '../server/utils'

@Controller('/site-settings')
export class SiteSettingsController {
  constructor(
    private readonly user: UserContext,
    private readonly log: Logger,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER_TOKEN) private readonly em: SqlEntityManager,
  ) {}

  @Get()
  async getSiteSettings(@Headers() headers: Record<string, string>) {
    let body

    // Request-specific logic
    if (isRequestFromFdaSubnet(this.log, headers[config.api.fdaSubnet.nginxIpHeader])) {
      Object.entries(config.siteSettings).forEach(([featureName, featureConfig]) => {
        body = {
          ...body,
          [featureName]: featureConfig.isEnabled ? featureConfig : { isEnabled: false },
        }
      })
      if (!isRequestFromAuthenticatedUser(headers)) {
        body = { ...body, cdmh: { isEnabled: false } }
      }
    } else {
      Object.entries(config.siteSettings).forEach(([featureName]) => {
        body = { ...body, [featureName]: { isEnabled: false } }
      })
    }

    if (!isRequestFromAuthenticatedUser(headers)) {
      return body
    }
    try {
      const dataPortalService = new dataPortal.DataPortalService(
        this.em,
        {} as client.PlatformClient,
      )
      await dataPortalService.getDefault(this.user.id)
      body.dataPortals = { isEnabled: true }
      return body
    } catch (error) {
      if (error instanceof errors.PermissionError || error instanceof errors.NotFoundError) {
        body.dataPortals = { isEnabled: false }
        return body
      } else {
        throw new errors.ServiceError(
          `Unexpected error while checking Data Portals feature: ${error}`,
        )
      }
    }
  }
}

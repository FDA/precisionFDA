import { SqlEntityManager } from '@mikro-orm/mysql'
import { Controller, Get, Headers, Inject, Logger } from '@nestjs/common'
import { config } from '@shared/config'
import { DEPRECATED_SQL_ENTITY_MANAGER } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import { AlertService } from '@shared/domain/alert/service/alert.service'
import { DataPortalService } from '@shared/domain/data-portal/service/data-portal.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { NotFoundError, PermissionError, ServiceError } from '@shared/errors'
import { PlatformClient } from '@shared/platform-client'
import { isRequestFromAuthenticatedUser, isRequestFromFdaSubnet } from '../server/utils'

@Controller('/site-settings')
export class SiteSettingsController {
  constructor(
    private readonly user: UserContext,
    private readonly log: Logger,
    private readonly alertService: AlertService,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER) private readonly em: SqlEntityManager,
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

    const alerts = await this.alertService.getAll(true)
    body = {
      ...body,
      alerts,
    }

    if (!isRequestFromAuthenticatedUser(headers)) {
      return body
    }
    try {
      const dataPortalService = new DataPortalService(this.em, {} as PlatformClient)
      await dataPortalService.getDefault(this.user.id)
      body.dataPortals = { isEnabled: true }
      return body
    } catch (error) {
      if (error instanceof PermissionError || error instanceof NotFoundError) {
        body.dataPortals = { isEnabled: false }
        return body
      } else {
        throw new ServiceError(`Unexpected error while checking Data Portals feature: ${error}`)
      }
    }
  }
}

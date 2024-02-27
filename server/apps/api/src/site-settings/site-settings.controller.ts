import { Controller, Get, Headers, Logger } from '@nestjs/common'
import { config } from '@shared/config'
import { AlertService } from '@shared/domain/alert/services/alert.service'
import { DataPortalService } from '@shared/domain/data-portal/service/data-portal.service'
import { NotFoundError, PermissionError, ServiceError } from '@shared/errors'
import { isRequestFromAuthenticatedUser, isRequestFromFdaSubnet } from '../server/utils'


/**
 * Controller for site settings. Site settings are used to control the visibility of features in the UI.
 * At the moment, the following features are supported:
 * CDMH, SSO button, Data Portals, Alerts.
 */
@Controller('/site-settings')
export class SiteSettingsController {
  constructor(
    private readonly log: Logger,
    private readonly dataPortalService: DataPortalService,
    private readonly alertService: AlertService,
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
    const customPortals = await this.dataPortalService.listAccessibleCustomPortals()
    try {
      await this.dataPortalService.getDefault()
      body.dataPortals = { isEnabled: true, customPortals }
      return body
    } catch (error) {
      if (error instanceof PermissionError || error instanceof NotFoundError) {
        body.dataPortals = { isEnabled: false, customPortals }
        return body
      } else {
        throw new ServiceError(`Unexpected error while checking Data Portals feature: ${error}`)
      }
    }
  }
}

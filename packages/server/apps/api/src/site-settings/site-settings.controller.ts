import { Controller, Get, Headers, Logger } from '@nestjs/common'
import { config } from '@shared/config'
import { AlertService } from '@shared/domain/alert/services/alert.service'
import { isRequestFromAuthenticatedUser, isRequestFromFdaSubnet } from '../server/utils'

/**
 * Controller for site settings. Site settings are used to control the visibility of features in the UI.
 * At the moment, the following features are supported:
 * CDMH, SSO button, Data Portals, Alerts.
 */
@Controller('/site-settings')
export class SiteSettingsController {
  constructor(
    private readonly logger: Logger,
    private readonly alertService: AlertService,
  ) {}

  @Get()
  async getSiteSettings(@Headers() headers: Record<string, string>) {
    let body

    // Request-specific logic
    if (isRequestFromFdaSubnet(this.logger, headers[config.api.fdaSubnet.nginxIpHeader])) {
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

    return body
  }
}

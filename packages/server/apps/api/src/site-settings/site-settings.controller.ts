import { Controller, Get, Headers, Logger, Query } from '@nestjs/common'
import { config } from '@shared/config'
import { AlertService } from '@shared/domain/alert/services/alert.service'
import { URLUtils } from '@shared/utils/url.utils'
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
    private readonly alertService: AlertService,
  ) {}

  @Get()
  async getSiteSettings(
    @Headers() headers: Record<string, string>,
    @Query('user_return_to') userReturnTo?: string,
  ) {
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
      if (userReturnTo?.length > 0 && body['ssoButton'].isEnabled) {
        const ssoUrl = body['ssoButton']['data']['fdaSsoUrl']
        body['ssoButton']['data']['fdaSsoUrl'] = URLUtils.replaceReturnURLForSSO(
          ssoUrl,
          userReturnTo,
        )
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

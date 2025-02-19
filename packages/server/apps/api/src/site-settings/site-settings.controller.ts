import { Controller, Get, Headers, Logger } from '@nestjs/common'
import { config } from '@shared/config'
import { AlertService } from '@shared/domain/alert/services/alert.service'
import { DataPortalService } from '@shared/domain/data-portal/service/data-portal.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { isRequestFromFdaSubnet } from '../server/utils'

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
    private readonly user: UserContext,
    private readonly dataPortalService: DataPortalService,
  ) {}

  @Get()
  async getSiteSettings(@Headers() headers: Record<string, string>) {
    let body

    // Request-specific logic
    if (isRequestFromFdaSubnet(this.logger, headers[config.api.nginxIpHeader])) {
      Object.entries(config.siteSettings).forEach(([featureName, featureConfig]) => {
        body = {
          ...body,
          [featureName]: featureConfig.isEnabled ? featureConfig : { isEnabled: false },
        }
      })
      if (!this.user.id) {
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
      dataPortals: {},
    }

    if (this.user?.id) {
      const dataPortalsList = await this.dataPortalService.list(true)
      const dataPortals = {
        daaas: {
          accessible: dataPortalsList.find((portal) => portal.urlSlug === 'daaas') !== undefined,
          tooltipText: 'This is the DaaaS Data Portal; access is controlled by the FDA.',
          mailto: 'precisionFDA@fda.hhs.gov?subject=DaaaS Data Portal access request',
        },
        prism: {
          accessible: dataPortalsList.find((portal) => portal.urlSlug === 'prism') !== undefined,
          tooltipText: 'This is the PRISM Data Portal; access is controlled by the FDA.',
          mailto:
            'virginia.Hussong@fda.hhs.gov?cc=precisionFDA@fda.hhs.gov&subject=PRISM Data Portal access request',
        },
        tools: {
          accessible: dataPortalsList.find((portal) => portal.urlSlug === 'tools') !== undefined,
          tooltipText:
            'This is the FDA Use Case Toolbox Data Portal; access is available for all FDA users.',
          mailto: 'precisionFDA@fda.hhs.gov?subject=Toolbox Data Portal access request',
        },
      }

      body = {
        ...body,
        dataPortals,
      }
    }

    return body
  }
}

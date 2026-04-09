import { Logger } from '@nestjs/common'
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { config } from '../config'
import { CaptchaResponse } from './captcha.response'

export class CaptchaService {
  @ServiceLogger()
  private readonly logger: Logger

  async verifyCaptchaAssessment(token: string, recaptchaAction: string, minimalScore = 0.7): Promise<boolean> {
    if (!config.api.captchaEnabled) {
      this.logger.debug('Skipping captcha verification in development or test environment')
      return true
    }

    const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${config.recaptcha.projectId}/assessments?key=${config.recaptcha.apiKey}`
    const body = {
      event: {
        token,
        siteKey: config.recaptcha.siteKey,
        expectedAction: recaptchaAction,
      },
    }
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: JSON.stringify(body),
      url,
      headers: { 'Content-Type': 'application/json' },
    }

    try {
      const res: AxiosResponse<CaptchaResponse> = await axios.request(options)
      const data = res.data

      return this.evaluateRecaptchaResponse(data, recaptchaAction, minimalScore)
    } catch (err: unknown) {
      this.logger.error('[RECAPTCHA] FAILED - API returned an error:', err)
      return false
    }
  }

  private evaluateRecaptchaResponse(result: CaptchaResponse, recaptchaAction: string, minimalScore: number): boolean {
    const tokenValid = result.tokenProperties.valid
    const tokenInvalidReason = result.tokenProperties.invalidReason
    const actualAction = result.tokenProperties.action
    const riskScore = result.riskAnalysis.score
    const riskScoreReasons = result.riskAnalysis.reasons

    if (!tokenValid) {
      this.logger.error(`[RECAPTCHA] FAILED - Token was invalid. Reason: ${tokenInvalidReason}`)
      return false
    }

    if (actualAction !== recaptchaAction) {
      this.logger.error(`[RECAPTCHA] FAILED - Action mismatch. Expected: ${recaptchaAction}, Got: ${actualAction}`)
      return false
    }

    if (riskScore < minimalScore) {
      this.logger.error(
        `[RECAPTCHA] FAILED - Score of ${riskScore} is below the minimum threshold of ${minimalScore} for action ${recaptchaAction} - reasons: ${riskScoreReasons.join(', ')}`,
      )
      return false
    }

    this.logger.debug(
      `[RECAPTCHA] PASSED - Action: ${recaptchaAction}, Score: ${riskScore}, Threshold: ${minimalScore}`,
    )
    return true
  }
}

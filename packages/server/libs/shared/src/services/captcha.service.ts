import { ENVS } from '@shared/enums'
import axios, { AxiosRequestConfig } from 'axios';
import { config } from '../config'

export class CaptchaService {

  async verifyCaptchaAssessment(token: string, recaptchaAction: string, minimalScore = 0.7): Promise<boolean> {
    if ([ENVS.DEVELOPMENT, ENVS.TEST].includes(config.env)) {
      return true
    }

    const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${config.recaptcha.projectId}/assessments?key=${config.recaptcha.apiKey}`
    const body = {
      event: {
        token,
        siteKey: config.recaptcha.siteKey,
        expectedAction: recaptchaAction
      },
    }
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: JSON.stringify(body),
      url,
      headers: { "Content-Type": "application/json" },
    }

    try {
      const res = await axios.request(options)
      const data = res.data

      return data.tokenProperties.valid &&
        data.tokenProperties.action === recaptchaAction
        && data.riskAnalysis.score >= minimalScore
    } catch (err) {
      console.log('An error occured during captcha validation!', err)
      return false
    }
  }



}


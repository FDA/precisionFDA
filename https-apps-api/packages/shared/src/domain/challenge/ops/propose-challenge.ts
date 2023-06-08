import { BaseOperation } from '../../../utils'
import { UserOpsCtx } from '../../../types'
import { CaptchaService } from '../../../services/captcha.service'
import { errors } from '../../..'

export type ChallengeProposeInput = {
  name: string,
  email: string,
  organisation: string,
  specific_question: string,
  specific_question_text: string,
  data_details: string,
  data_details_text: string,
  captchaValue?: string
}

export class ChallengeProposeOperation extends BaseOperation<
  UserOpsCtx,
  ChallengeProposeInput,
  void
> {

  async run(input: ChallengeProposeInput): Promise<void> {
    const userId = this.ctx.user?.id

    let canProposeChallenge = true
    if (!userId) {
      const captcha = new CaptchaService()
      canProposeChallenge = await captcha.verifyCaptchaAssessment(input.captchaValue!, 'propose')
    }

    if (canProposeChallenge) {
      // SEND CHALLENGE PROPOSE EMAIL WHEN TEMPLATE READY FOR NODE
    }
    else {
      throw new errors.ValidationError("Not permitted to propose a challenge!")
    }

  }
}
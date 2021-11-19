/* eslint-disable max-len */
import { EmailTemplateInput } from '../../email.config'
import {
  header,
  footer,
  getBottomSpacer,
  getMiddleSpacer,
  viewChallengePreregPageCtoButton,
} from './common'

export type ChallengePreregTemplateInput = EmailTemplateInput & {
  content: {
    challenge: { name: string; id: number }
  }
}

export const challengePreregTemplate = (data: ChallengePreregTemplateInput): string => `
  ${header}
    <mj-section css-class="header-title">
      <mj-column>
        <mj-text align="right">
          Challenge preregistration opened
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section css-class="body-section">
      <mj-column>
        <mj-text>
          Hello ${data.receiver.firstName}!
        </mj-text>
        <mj-text>
          You may now pre-register for a new upcoming challenge on precisionFDA:
        </mj-text>
        <mj-text>
          ${data.content.challenge.name}
        </mj-text>
        ${viewChallengePreregPageCtoButton(data.content.challenge.id)}
        ${getMiddleSpacer()}
        <mj-text>
          You can learn more about this challenge and register to be notified when it opens by clicking the button above.  If you do not want to receive further emails about new challenges on precisionFDA, you can opt out of these emails by logging in and going to "Notification Settings" in the dropdown under your profile name.        </mj-text>
        ${getBottomSpacer()}
      </mj-column>
    </mj-section>
  ${footer}
`

/* eslint-disable max-len */
import { EmailTemplateInput } from '../../email.config'
import { header, footer, getBottomSpacer, getChallengeCtoButton, getMiddleSpacer } from './common'

export type ChallengeOpenedTemplateInput = EmailTemplateInput & {
  content: {
    challenge: { name: string; id: number }
  }
}

export const challengeOpenedTemplate = (data: ChallengeOpenedTemplateInput): string => `
  ${header}
    <mj-section css-class="header-title">
      <mj-column>
        <mj-text align="right">
          New challenge
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section css-class="body-section">
      <mj-column>
        <mj-text>
          Hello ${data.receiver.firstName}!
        </mj-text>
        <mj-text>
          A new challenge has opened on precisionFDA:
        </mj-text>
        <mj-text>
          ${data.content.challenge.name}
        </mj-text>
        ${getChallengeCtoButton(data.content.challenge.id)}
        ${getMiddleSpacer()}
        <mj-text>
          You can learn more about this challenge, see the instructions, and join the challenge by clicking the button above.  If you do not want to receive further emails about new challenges on precisionFDA, you can opt out of these emails by logging in and going to "Notification Settings" in the dropdown under your profile name.
        </mj-text>
        ${getBottomSpacer()}
      </mj-column>
    </mj-section>
  ${footer}
`

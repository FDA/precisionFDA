import { User } from '@shared/domain/user/user.entity'
import { footer, getBottomSpacer, header } from './common'

export type UserInactivityAlertEmailInput = {
  receiver: User
  daysLeft: number
}

export const userInactivityAlertTemplate = (data: UserInactivityAlertEmailInput): string => `
  ${header}
  <mj-section css-class="header-title">
      <mj-column>
        <mj-text align="right">
          INACTIVITY ALERT
        </mj-text>
      </mj-column>
    </mj-section>
  <mj-section css-class="body-section">
    <mj-column width="100%">
      <mj-text>
        <p>Dear ${data.receiver.firstName}:<br/>Accounts on precisionFDA are automatically locked after 60 days of inactivity, in accordance with FISMA guidelines. Your account will be locked in ${data.daysLeft} days if you do not log in; once locked, you will need to contact precisionFDA support to request that your account be unlocked. Please log in to precisionFDA to ensure your access to the platform is not interrupted.</p>
      </mj-text>
      ${getBottomSpacer()}
    </mj-column>
  </mj-section>
  ${footer}
`

import { EmailTemplateInput } from '@shared/domain/email/email.config'
import { header, footer, getBottomSpacer, getViewSpaceButton } from './common'

export type MemberChangeTemplateInput = EmailTemplateInput & {
  content: {
    initiator: { fullName: string }
    action: string
    newMember: { fullName: string; role: string }
    space: { name: string; id: number }
  }
}

export const memberChangedTemplate = (data: MemberChangeTemplateInput): string => `
  ${header}
    <mj-section css-class="header-title">
      <mj-column>
        <mj-text align="right">
          ${data.content.action}
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section css-class="body-section">
      <mj-column>
        <mj-text>
          Hello ${data.receiver.firstName}!
        </mj-text>
        <mj-text>
          Space member ${data.content.initiator.fullName} ${data.content.action}:
        </mj-text>
        <mj-text>
          name: ${data.content.newMember.fullName}
        </mj-text>
        <mj-text>
          role: ${data.content.newMember.role}
        </mj-text>
          ${getViewSpaceButton(data.content.space.id)}
          ${getBottomSpacer()}
        </mj-column>
    </mj-section>
  ${footer}
`

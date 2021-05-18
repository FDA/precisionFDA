import { EmailTemplateInput } from '../../email.config'
import { header, footer, generateSpaceLink } from './common'

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
      <mj-text>
        View space <a href="${generateSpaceLink(data.content.space.id)}">${
  data.content.space.name
}</a>
      </mj-text>
    </mj-column>
  ${footer}
`

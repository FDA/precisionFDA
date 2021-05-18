import { EmailTemplateInput } from '../../email.config'
import { header, footer } from './common'

export type MemberChangeTemplateInput = EmailTemplateInput & {
  content: {
    initiator: { fullName: string }
    action: string
    newMember: { fullName: string; role: string }
    space: { name: string }
  }
}

export const memberChangedTemplate = (data: MemberChangeTemplateInput): string => `
  ${header}
    <mj-column>
      <mj-text>
        Hello ${data.receiver.firstName}!
      </mj-text>
      <mj-text>
        ${data.content.initiator.fullName} ${data.content.action}:
      </mj-text>
      <mj-text>
        name: ${data.content.newMember.fullName}
      </mj-text>
      <mj-text>
        name: ${data.content.newMember.role}
      </mj-text>
      <mj-text>
        View space ${data.content.space.name} (todo: link)
      </mj-text>
    </mj-column>
  ${footer}
`

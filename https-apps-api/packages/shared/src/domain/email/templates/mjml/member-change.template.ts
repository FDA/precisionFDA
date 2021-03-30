import { EmailTemplateInput } from '../../email.config'

export type MemberChangeTemplateInput = EmailTemplateInput & {
  content: {
    initiator: { fullName: string }
    action: string
    newMember: { fullName: string; role: string }
    space: { name: string }
  }
}

export const memberChangedTemplate = (data: MemberChangeTemplateInput): string => `
  <mjml>
      <mj-body>
        <mj-section>
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
          </mj-column>
        </mj-section>
        <mj-section>
          <mj-text>
            View space ${data.content.space.name} (todo: link)
          </mj-text>
        </mj-section>
      </mj-body>
    </mjml>
`

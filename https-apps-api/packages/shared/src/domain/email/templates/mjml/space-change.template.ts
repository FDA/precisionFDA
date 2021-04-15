import { EmailTemplateInput } from '../../email.config'

export type SpaceChangeTemplateInput = EmailTemplateInput & {
  content: {
    initiator: { fullName: string }
    action: string
    space: { name: string }
  }
}

export const spaceChangedTemplate = (data: SpaceChangeTemplateInput): string => `
  <mjml>
      <mj-body>
        <mj-section>
          <mj-column>
            <mj-text>
              Hello ${data.receiver.firstName}!
            </mj-text>
            <mj-text>
              The space ${data.content.space.name} was ${data.content.action}
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

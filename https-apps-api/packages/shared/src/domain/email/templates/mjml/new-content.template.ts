import { EmailTemplateInput } from '../../email.config'

export type NewContentTemplateInput = EmailTemplateInput & {
  content: {
    entityType: string
    objectType: string
    action: string
    user: {
      fullName: string
    }
    space: {
      name: string
    }
  }
}

export const newContentTemplate = (data: NewContentTemplateInput): string => `
  <mjml>
    <mj-body>
      <mj-section>
        <mj-column>
          <mj-text>
            Hello ${data.receiver.firstName}!
          </mj-text>
          <mj-text>
            ${data.content.objectType} ${data.content.action} by ${data.content.user.fullName}
            to the space ${data.content.space.name}.
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
`

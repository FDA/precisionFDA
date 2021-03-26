import { EmailTemplateInput } from '../../email.config'

export type NewContentTemplateInput = EmailTemplateInput & {
  content: {
    entityType: string
    user: {
      firstName: string
      lastName: string
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
            New ${data.content.entityType} added by ${data.content.user.firstName}
            to the space ${data.content.space.name}
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
`

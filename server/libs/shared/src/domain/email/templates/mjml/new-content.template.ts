import { EmailTemplateInput } from '@shared/domain/email/email.config'
import { header, footer, getBottomSpacer, getViewSpaceButton } from './common'

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
      id: number
    }
  }
}

export const newContentTemplate = (data: NewContentTemplateInput): string => `
  ${header}
    <mj-section css-class="header-title">
      <mj-column>
        <mj-text align="right">
          ${data.content.objectType} ${data.content.action}
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section css-class="body-section">
      <mj-column>
        <mj-text>
          Hello ${data.receiver.firstName}!
        </mj-text>
        <mj-text>
          ${data.content.objectType} ${data.content.action} by ${data.content.user.fullName}
          to the space ${data.content.space.name}.
        </mj-text>
        ${getViewSpaceButton(data.content.space.id)}
        ${getBottomSpacer()}
      </mj-column>
    </mj-section>
  ${footer}
`

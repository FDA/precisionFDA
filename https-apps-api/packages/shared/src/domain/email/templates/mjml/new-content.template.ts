import { EmailTemplateInput } from '../../email.config'
import { header, footer, generateSpaceLink } from './common'

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
    <mj-column>
      <mj-text>
        Hello ${data.receiver.firstName}!
      </mj-text>
      <mj-text>
        ${data.content.objectType} ${data.content.action} by ${data.content.user.fullName}
        to the space ${data.content.space.name}.
      </mj-text>
      <mj-text>
        View space <a href="${generateSpaceLink(data.content.space.id)}">${
  data.content.space.name
}</a>
      </mj-text>
    </mj-column>
  ${footer}
`

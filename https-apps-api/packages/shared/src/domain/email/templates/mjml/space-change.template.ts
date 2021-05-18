import { EmailTemplateInput } from '../../email.config'
import { header, footer, generateSpaceLink } from './common'

export type SpaceChangeTemplateInput = EmailTemplateInput & {
  content: {
    initiator: { fullName: string }
    action: string
    space: { name: string; id: number }
  }
}

export const spaceChangedTemplate = (data: SpaceChangeTemplateInput): string => `
  ${header}
    <mj-column>
      <mj-text>
        Hello ${data.receiver.firstName}!
      </mj-text>
      <mj-text>
        The space ${data.content.space.name} was ${data.content.action}
      </mj-text>
      <mj-text>
        View space <a href="${generateSpaceLink(data.content.space.id)}">${
  data.content.space.name
}</a>
      </mj-text>
  ${footer}
`

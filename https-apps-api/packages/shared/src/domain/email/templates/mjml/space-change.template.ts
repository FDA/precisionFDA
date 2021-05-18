import { EmailTemplateInput } from '../../email.config'
import { header, footer } from './common'

export type SpaceChangeTemplateInput = EmailTemplateInput & {
  content: {
    initiator: { fullName: string }
    action: string
    space: { name: string }
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
        View space ${data.content.space.name} (todo: link)
      </mj-text>
  ${footer}
`

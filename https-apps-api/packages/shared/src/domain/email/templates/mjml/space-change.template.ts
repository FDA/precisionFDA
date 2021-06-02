import { EmailTemplateInput } from '../../email.config'
import { header, footer, getBottomSpacer, getViewSpaceButton } from './common'

export type SpaceChangeTemplateInput = EmailTemplateInput & {
  content: {
    initiator: { fullName: string }
    action: string
    space: { name: string; id: number }
  }
}

export const spaceChangedTemplate = (data: SpaceChangeTemplateInput): string => `
  ${header}
    <mj-section css-class="header-title">
      <mj-column>
        <mj-text align="right">
          New comment added
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section css-class="body-section">
      <mj-column>
        <mj-text>
          Hello ${data.receiver.firstName}!
        </mj-text>
        <mj-text>
          The space ${data.content.space.name} was ${data.content.action}
        </mj-text>
        ${getViewSpaceButton(data.content.space.id)}
        ${getBottomSpacer()}
      </mj-column>
    </mj-section>
  ${footer}
`

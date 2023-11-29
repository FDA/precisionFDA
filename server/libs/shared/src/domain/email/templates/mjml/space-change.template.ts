import { EmailTemplateInput } from '../../email.config'
import { header, footer, getBottomSpacer, getViewSpaceButton, getMiddleSpacer } from './common'

export type SpaceChangeTemplateInput = EmailTemplateInput & {
  content: {
    initiator: { fullName: string }
    action: string
    space: { name: string; id: number }
    receiversSides: object,
    spaceMembership: { side?: number }
    spaceMembershipSide: string,
    receiverMembershipSide: string,
  }
}

export const spaceChangedTemplate = (data: SpaceChangeTemplateInput): string => `
  ${header}
    <mj-section css-class="header-title">
      <mj-column>
        <mj-text align="right">
          SPACE ${data.content.action}
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
        ${
          // @ts-ignore
          (((data.content.receiversSides[data.receiver.id] === 'GUEST') &&
            (data.content.action === 'locked')) ||
            (data.content.action === 'deleted'))
            ? getMiddleSpacer() : getViewSpaceButton(data.content.space.id)}
        ${getBottomSpacer()}
      </mj-column>
    </mj-section>
  ${footer}
`

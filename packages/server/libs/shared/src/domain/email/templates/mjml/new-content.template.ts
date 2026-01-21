import { footer, getBottomSpacer, getViewSpaceButton, header } from './common'

export type NewContentTemplateInput = {
  firstName: string
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

export const fromOrTo = (action: string): string => {
  return action === 'added' ? 'to' : 'from'
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
          Hello ${data.firstName}!
        </mj-text>
        <mj-text>
          ${data.content.objectType} ${data.content.action} by ${data.content.user.fullName}
          ${fromOrTo(data.content.action)} the space ${data.content.space.name}.
        </mj-text>
        ${getViewSpaceButton(data.content.space.id)}
        ${getBottomSpacer()}
      </mj-column>
    </mj-section>
  ${footer}
`

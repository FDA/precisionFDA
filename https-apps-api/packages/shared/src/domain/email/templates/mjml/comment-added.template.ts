import { EmailTemplateInput } from '../../email.config'
import { header, footer, generateCommentLink, getViewSpaceButton, getBottomSpacer } from './common'

export type CommentAddedTemplateInput = EmailTemplateInput & {
  content: {
    initiator: { fullName: string }
    comment: { body: string; id: number }
    space: { id: number }
  }
}

export const commentAddedTemplate = (data: CommentAddedTemplateInput): string => `
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
          User ${data.content.initiator.fullName} added a new <a href=${generateCommentLink(
  data.content.comment.id,
  data.content.space.id,
)}>comment</a>:
        </mj-text>
        <mj-text>
          <blockquote>
            ${data.content.comment.body}
          </blockquote>
        </mj-text>
        ${getViewSpaceButton(data.content.space.id)}
        ${getBottomSpacer()}
      </mj-column>
    </mj-section>
  ${footer}
`

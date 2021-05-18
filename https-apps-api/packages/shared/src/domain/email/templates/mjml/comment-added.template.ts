import { EmailTemplateInput } from '../../email.config'
import { header, footer, generateCommentLink } from './common'

export type CommentAddedTemplateInput = EmailTemplateInput & {
  content: {
    initiator: { fullName: string }
    comment: { body: string; id: number }
    space: { id: number }
  }
}

export const commentAddedTemplate = (data: CommentAddedTemplateInput): string => `
  ${header}
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
        ${data.content.comment.body}
      </mj-text>
    </mj-column>
  ${footer}
`

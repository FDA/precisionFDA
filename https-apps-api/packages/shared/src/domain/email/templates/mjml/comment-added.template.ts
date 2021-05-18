import { EmailTemplateInput } from '../../email.config'
import { header, footer } from './common'

export type CommentAddedTemplateInput = EmailTemplateInput & {
  content: {
    initiator: { fullName: string }
    comment: { body: string }
  }
}

export const commentAddedTemplate = (data: CommentAddedTemplateInput): string => `
  ${header}
    <mj-column>
      <mj-text>
        Hello ${data.receiver.firstName}!
      </mj-text>
      <mj-text>
        User ${data.content.initiator.fullName} added a new comment. (todo: link)
      </mj-text>
      <mj-text>
        ${data.content.comment.body}
      </mj-text>
    </mj-column>
  ${footer}
`

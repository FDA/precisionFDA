import { EmailTemplateInput } from '../../email.config'

export type CommentAddedTemplateInput = EmailTemplateInput & {
  content: {
    initiator: { fullName: string }
    comment: { body: string }
  }
}

export const commentAddedTemplate = (data: CommentAddedTemplateInput): string => `
  <mjml>
      <mj-body>
        <mj-section>
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
        </mj-section>
      </mj-body>
    </mjml>
`

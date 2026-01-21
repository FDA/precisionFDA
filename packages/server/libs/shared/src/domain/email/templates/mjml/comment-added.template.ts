import { footer, getBottomSpacer, getViewSpaceButton, header } from './common'

export type CommentAddedTemplateInput = {
  firstName: string
  content: {
    initiator: { fullName: string }
    comment: { body: string; id: number; contentObjectId: number; contentObjectType: string }
    space: { id: number }
    objectCommentsLink: string
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
          Hello ${data.firstName}!
        </mj-text>
        <mj-text>
          User ${data.content.initiator.fullName} added a new <a href=${data.content.objectCommentsLink}>comment</a>:
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

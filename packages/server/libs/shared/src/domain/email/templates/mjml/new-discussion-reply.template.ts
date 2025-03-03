import { footer, getBottomSpacer, header } from './common'

export type DiscussionEmailInput = {
  url: string
  spaceName: string
}

export const newDiscussionReplyTemplate = (data: DiscussionEmailInput): string => `
  ${header}
  <mj-section css-class="header-title">
      <mj-column>
        <mj-text align="right">
          New Discussion Reply
        </mj-text>
      </mj-column>
    </mj-section>
  <mj-section css-class="body-section">
    <mj-column width="100%">
      <mj-text>
<p>As a member of precisionFDA${data.spaceName ? ' space ' + data.spaceName : ''}, you are receiving this notification because a fellow member has posted a new discussion reply${data.spaceName ? ' in this space' : ''} that they would like you to read or that you are following.</p>      </mj-text>
      </mj-text>
      <mj-button
        background-color="#1F70B5"
        line-weight="30px"
        padding-top="10px"
        font-weight="bold"
        font-size="16px"
        align="left"
        href="${data.url}">
        View Discussion
      </mj-button>
      ${getBottomSpacer()}
    </mj-column>
  </mj-section>
  ${footer}
`

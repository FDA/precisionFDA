import { footer, getBottomSpacer, header } from './common'

export type DiscussionEmailInput = {
  url: string
  spaceName: string
}

export const spaceDiscussionTemplate = (data: DiscussionEmailInput): string => `
  ${header}
  <mj-section css-class="header-title">
      <mj-column>
        <mj-text align="right">
          SPACE NOTIFICATION
        </mj-text>
      </mj-column>
    </mj-section>
  <mj-section css-class="body-section">
    <mj-column width="100%">
      <mj-text>
        <p>As a member of precisionFDA space "${data.spaceName}", you are being notified that a fellow member has posted a discussion thread or comment in the space that they would like you to read.</p>
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

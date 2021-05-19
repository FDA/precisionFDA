/* eslint-disable max-len */
import { config } from '../../../../..'

const header = `
  <mjml>
    <mj-head>
      <mj-attributes>
        <mj-all font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" padding="0px"></mj-all>
        <mj-text font-size="16px" line-height="30px"></mj-text>
      </mj-attributes>
      <mj-style inline="inline">
        body {
          padding-top: 20px;
          padding-bottom: 20px; padding-left: 10px; padding-right: 10px; background-color: #f4f8fb; }
        a { color: #1F70B5; }
        .footer-section { background-color: none; }
        .header-section { padding-bottom: 20px; padding-left: 10px; padding-right: 10px; }
        .header-title {
          padding-bottom: 20px;
          text-transform: uppercase;
          font-weight: 300;
          color: #0a0a0a;
          letter-spacing: 1px;
        }
        .header-text { text-align: right; }
        .spacer-section { padding-bottom: 16px; }
        .body-section {
          border: 1px solid #cfe0ed;
          border-radius: 3px;
          background-color: #fff;
          padding: 20px;
          line-height: 1.8;
        }
      </mj-style>
    </mj-head>
      <mj-body>
        <mj-section css-class="header-section">
          <mj-text>
            <a href="${config.api.railsHost}" title="precisionFDA">
              <img src="${config.api.railsHost}/assets/precisionFDA.email.dark.png" />
            </a>
          </mj-text>
        </mj-section>
`

const footer = `
      </mj-body>
    </mjml>
`

// entity involved, space route does not work
const generateCommentLink = (commentId: number, spaceId: number): string =>
  `${config.api.railsHost}/spaces/${spaceId.toString()}/discuss`

const generateSpaceLink = (spaceId: number): string =>
  `${config.api.railsHost}/spaces/${spaceId.toString()}`

const getViewSpaceButton = (spaceId: number): string => `
  <mj-button
    background-color="#1F70B5"
    line-weight="30px"
    padding-top="10px"
    font-weight="bold"
    font-size="16px"
    align="left"
    href="${generateSpaceLink(spaceId)}"
  >
    View space
  </mj-button>
`

const getBottomSpacer = (): string => '<mj-spacer height="16px" />'

export {
  header,
  footer,
  generateCommentLink,
  generateSpaceLink,
  getViewSpaceButton,
  getBottomSpacer,
}

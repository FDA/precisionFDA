import { config } from '../../../../..'

const header = `
  <mjml>
      <mj-body>
        <mj-section>
          <mj-text>
            <a href="${config.api.railsHost}" title="precisionFDA">
              <img src="${config.api.railsHost}/assets/precisionFDA.email.dark.png" />
            </a>
          </mj-text>
        </mj-section>
        <mj-section>
`

const footer = `
        </mj-section>
      </mj-body>
    </mjml>
`

// entity involved, space route does not work
const generateCommentLink = (commentId: number, spaceId: number): string =>
  `${config.api.railsHost}/spaces/${spaceId.toString()}/discuss`

const generateSpaceLink = (spaceId: number): string =>
  `${config.api.railsHost}/spaces/${spaceId.toString()}`

export { header, footer, generateCommentLink, generateSpaceLink }

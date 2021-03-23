import { AnyObject } from '../../../../types'

// todo: come up with smart typings for data
export const newContentTemplate = (data: AnyObject): string => `
  <mjml>
    <mj-body>
      <mj-section>
        <mj-column>
          <mj-text>
            Hello ${data.receiver.firstName}!
          </mj-text>
          <mj-text>
            New ${data.contentType} added by ${data.user.fullName}
            to the space ${data.space.title}
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
`

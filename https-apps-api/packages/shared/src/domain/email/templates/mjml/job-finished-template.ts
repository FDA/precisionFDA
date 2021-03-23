import { AnyObject } from '../../../../types'

// todo: come up with smart typings for data
export const jobFinishedTemplate = (data: AnyObject): string => `
  <mjml>
    <mj-body>
      <mj-section>
        <mj-column>
          <mj-text>
            Hello ${data.receiver.firstName}!
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
`

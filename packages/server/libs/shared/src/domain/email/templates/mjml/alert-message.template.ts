import {
  footer,
  getBottomSpacer,
  getMiddleSpacer,
  header,
} from '@shared/domain/email/templates/mjml/common'
import { AlertMessageInputDto } from '@shared/domain/email/dto/alert-message-input.dto'

export const alertMessageTemplate = (alertMessageInput: AlertMessageInputDto): string => `
  ${header}
    <mj-section css-class="header-title">
      <mj-column>
        <mj-image src="\${HOST}/assets/precisionFDA.email.dark.png" alt="precisionFDA" href="\${HOST}" title="precisionFDA" />
      </mj-column>
      <mj-column>
        <mj-text align="right">
          ${alertMessageInput.subject}
        </mj-text>
      </mj-column>
    </mj-section>

    <mj-section css-class="body-section">
      <mj-column>
        <mj-text>
          ${alertMessageInput.message}
        </mj-text>
      </mj-column>
    </mj-section>

    ${getMiddleSpacer()}
    <mj-section>
      <mj-column>
        <mj-text>
          If you have any questions, feel free to reach out to support.
        </mj-text>
      </mj-column>
    </mj-section>
    ${getBottomSpacer()}
  ${footer}
`

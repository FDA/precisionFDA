import { EmailTemplateInput } from '../../email.config'
import { header, footer } from './common'

export type JobFinishedInputTemplate = EmailTemplateInput & {
  content: {}
}

export const jobFinishedTemplate = (data: JobFinishedInputTemplate): string => `
  ${header}
    <mj-column>
      <mj-text>
        Hello ${data.receiver.firstName}!
      </mj-text>
    </mj-column>
  ${footer}
`

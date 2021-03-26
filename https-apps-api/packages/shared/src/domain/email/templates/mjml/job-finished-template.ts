import { EmailTemplateInput } from '../../email.config'

export type JobFinishedInputTemplate = EmailTemplateInput & {
  content: {}
}

export const jobFinishedTemplate = (data: JobFinishedInputTemplate): string => `
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

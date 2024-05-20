import { EmailTemplateInput } from '@shared/domain/email/email.config'
import { header, footer, getBottomSpacer, getExecutionDetailButton } from './common'

export type JobStaleInputTemplate = EmailTemplateInput & {
  content: {
    job: {
      id: number
      uid: string
      name: string
    }
    maxDuration?: string
  }
}

export const jobStaleTemplate = (data: JobStaleInputTemplate): string => `
  ${header}
    <mj-section css-class="header-title">
      <mj-column>
        <mj-text align="right">
          Execution ${data.content.job.name} will terminate
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section css-class="body-section">
      <mj-column>
        <mj-text>
          Hello ${data.receiver.firstName},
        </mj-text>
        <mj-text>
          The precisionFDA Workstation, ${
            data.content.job.name
          }, is set to expire and terminate in 24 hours.  Upon termination, all data on the worker will be deleted and cannot be recovered, so it is strongly recommended that you save any work you want to be preserved.
        </mj-text>
        <mj-text>
          You may save work on the Workstation by connecting to the Workstation and using 'dx upload' to push individual files to your precisionFDA private cloud environment.  You may also run 'dx-snapshot' to create a saved snapshot archive of the entire Workstation instance, including all files.  Snapshots will take several minutes to create but are automatically uploaded to the precisionFDA cloud after creation.
        </mj-text>
        ${getExecutionDetailButton(data.content.job.uid)}
        ${getBottomSpacer()}
      </mj-column>
    </mj-section>
  ${footer}
`

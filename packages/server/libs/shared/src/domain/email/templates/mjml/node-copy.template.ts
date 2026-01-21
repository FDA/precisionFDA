import { header, footer, getBottomSpacer, getMiddleSpacer } from './common'

export type NodeCopyTemplateInput = {
  subject: string
  destination: string
  notCopiedFolderNames: string[]
  notCopiedFileNames: string[]
}

export const nodeCopyTemplate = (data: NodeCopyTemplateInput): string => `
  ${header}

    <!-- Hidden email preview text -->
    <mj-section css-class="hidden-email-preview">
      <mj-column>
        <mj-text>
          ${data.subject}
        </mj-text>
      </mj-column>
    </mj-section>

    ${getMiddleSpacer()}

    <!-- Email Header -->
    <mj-section css-class="header">
      <mj-column>
        <mj-text align="right" css-class="header-title">${data.subject}</mj-text>
      </mj-column>
    </mj-section>

    <!-- Body Section -->
    <mj-section css-class="body-section radius">
      <mj-column>
        <mj-text>
          ${data.subject}
        </mj-text>

        <!-- Not Copied Folders Section -->
        ${
          data.notCopiedFolderNames && data.notCopiedFolderNames.length > 0
            ? `
          <mj-text>
            The following folders haven't been copied since they already exist in ${data.destination}:
          </mj-text>
          <mj-text>${data.notCopiedFolderNames.join(', ')}</mj-text>
        `
            : ''
        }

        <!-- Not Copied Files Section -->
        ${
          data.notCopiedFileNames && data.notCopiedFileNames.length > 0
            ? `
          <mj-text>
            The following files haven't been copied since they already exist in ${data.destination}:
          </mj-text>
          <mj-text>${data.notCopiedFileNames.join(', ')}</mj-text>
        `
            : ''
        }
      </mj-column>
    </mj-section>

    ${getBottomSpacer()}

  ${footer}
`

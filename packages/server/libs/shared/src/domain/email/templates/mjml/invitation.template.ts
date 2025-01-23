import { EmailTemplateInput } from '@shared/domain/email/email.config'
import { header, footer, getBottomSpacer, getMiddleSpacer } from './common'

export type InvitationTemplateInput = EmailTemplateInput & {
  firstName: string
  lastName: string
  email: string
  address1: string
  address2: string
  phone: string
  duns: string
  reqReason: string
  reqData: string
  reqSoftware: string
  researchIntent: boolean
  clinicalIntent: boolean
  participateIntent: boolean
  organizeIntent: boolean
  ip: string
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  return emailRegex.test(email)
}

/**
 * Constructs a username by combining the first and last names.
 * Non-alphabetical characters are removed, and everything is converted to lowercase.
 *
 * @param first - The first name.
 * @param last - The last name.
 * @returns {string} - The generated username.
 */
function constructUsername(first: string, last: string): string {
  const cleanFirst = first.toLowerCase().replace(/[^a-z]/g, '')
  const cleanLast = last.toLowerCase().replace(/[^a-z]/g, '')
  return `${cleanFirst}.${cleanLast}`
}

/**
 * Checks if a username is acceptable based on length and pattern.
 * The username must be between 3 and 255 characters, and follow a specific regex pattern.
 *
 * @param username - The username to validate.
 * @returns {boolean} - Returns true if the username is acceptable, false otherwise.
 */
function authserverAcceptable(username: string): boolean {
  const usernameRegex = /^[a-z][0-9a-z_.]{2,}$/
  return username.length >= 3 && username.length <= 255 && usernameRegex.test(username)
}

export const invitationTemplate = (data: InvitationTemplateInput): string => `
  ${header}

  <!-- Hidden email preview text -->
  <mj-section css-class="hidden-email-preview">
    <mj-column>
      <mj-text>
        Access Request for ${data.firstName} ${data.lastName} - ${data.email}
      </mj-text>
    </mj-column>
  </mj-section>

  ${getMiddleSpacer()}

  <!-- Email Header -->
  <mj-section css-class="header">
    <mj-column>
      <mj-text align="right" css-class="header-title">Access Request</mj-text>
    </mj-column>
  </mj-section>

  <!-- Body Section - Submitted Information -->
  <mj-section css-class="body-section radius">
    <mj-column>
      <mj-text>
        <h5>Submitted information</h5>
      </mj-text>
      <mj-table>
        <tr><td>First name:</td><td>${data.firstName}</td></tr>
        <tr><td>Last name:</td><td>${data.lastName}</td></tr>
        <tr><td>Email:</td><td>${data.email}</td></tr>
        <tr><td>Address 1:</td><td>${data.address1}</td></tr>
        <tr><td>Address 2:</td><td>${data.address2}</td></tr>
        <tr><td>Phone:</td><td>${data.phone}</td></tr>
        <tr><td>DUNS:</td><td>${data.duns}</td></tr>
        <tr><td>Request reason:</td><td>${data.reqReason}</td></tr>
        <tr><td>Has Data:</td><td>${data.reqData}</td></tr>
        <tr><td>Has Software:</td><td>${data.reqSoftware}</td></tr>
        <tr><td>Research intent?</td><td>${data.researchIntent ? 'Yes' : 'No'}</td></tr>
        <tr><td>Clinical intent?</td><td>${data.clinicalIntent ? 'Yes' : 'No'}</td></tr>
        <tr><td>Participate intent for appathon or challenges?</td><td>${data.participateIntent ? 'Yes' : 'No'}</td></tr>
        <tr><td>Organize intent for appathon or challenges?</td><td>${data.organizeIntent ? 'Yes' : 'No'}</td></tr>
      </mj-table>
    </mj-column>
  </mj-section>

  ${getMiddleSpacer()}

  <!-- Additional System Information -->
  <mj-section css-class="body-section radius">
    <mj-column>
      <mj-text>
        <h5>Additional system information</h5>
      </mj-text>
      <mj-table>
        <tr><td>Client IP address:</td><td>${data.ip}</td></tr>
        <tr><td>Geolocation:</td><td><a href="http://ip-api.com/#${data.ip}" target="_blank">Click to determine</a></td></tr>
        <tr><td>Email acceptable?</td><td>${validateEmail(data.email) ? 'Yes' : 'No'}</td></tr>
        <tr><td>Potential username:</td><td>${constructUsername(data.firstName, data.lastName)}</td></tr>
        <tr><td>Username acceptable?</td><td>${authserverAcceptable(constructUsername(data.firstName, data.lastName)) ? 'Yes' : 'No'}</td></tr>
      </mj-table>
    </mj-column>
  </mj-section>

  ${getBottomSpacer()}

  ${footer}
`

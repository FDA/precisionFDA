/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { useScrollToHash } from '../../../hooks/useScrollToHash'
import { DocBody } from '../styles'

export const OrganizationsDeprecation = () => {
  useScrollToHash()
  return (
    <DocBody>
      <h1>Organizations Deprecation</h1>

      <p>
        To improve the precisionFDA user experience, we have decided to
        deprecate the Organization (or "Org") functionality of the site.
        Specifically, we will be making the following changes:
      </p>
      <ul>
        <li>
          A user's organizational affiliation will no longer be publicly visible
          on precisionFDA, including the Public Profile page and in Challenge
          Submissions. Challenge winners will be given the option to have an
          organizational affiliation listed next to their name.
        </li>
        <li>
          New users will not be asked for their organizational affiliation.
        </li>
        <li>
          No new organizations will be created, and new users will no longer
          have the option of becoming an organization administrator when they
          sign up.
        </li>
        <li>
          Users that are currently members of organizations will be able to
          request that the precisionFDA administrator remove them from their
          organizational affiliation (i.e. transition them to a
          “self-representing” user). Org administrators will also be able to
          request the removal of users from their orgs.
        </li>
      </ul>

      <h2 id="unaffected-functionality">Unaffected Functionality</h2>

      <p>The following functionality will for now remain as-is:</p>
      <ul>
        <li>Current orgs will continue to exist.</li>
        <li>
          Current org administrators will continue to have the ability to view
          the org members and provision new users via their Profile page.
        </li>
        <li>
          The role of org administrator can be transitioned from one user to
          another, upon both users communicating their agreement to the
          precisionFDA administrator.
        </li>
      </ul>

      <h2 id="application">Application</h2>

      <p>
        These changes will be rolled out over the next several weeks. We hope
        that these changes will improve the experience for all precisionFDA
        users. Please contact{' '}
        <a href="mailto:precisionfda@fda.hhs.gov">precisionfda@fda.hhs.gov</a>{' '}
        with any questions or concerns.
      </p>
    </DocBody>
  )
}

/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { useScrollToHash } from '../../../hooks/useScrollToHash'
import admindashboard from '../images/admin_dashboard.png'
import deactivatedusers from '../images/deactivated_users.png'
import exploringusers1 from '../images/exploring_users1.png'
import exploringusers2 from '../images/exploring_users2.png'
import exploringusers3 from '../images/exploring_users3.png'
import pendingusers from '../images/pending_users.png'
import { DocBody } from '../styles'

export const SiteAdministration = () => {
  useScrollToHash()
  return (
    <DocBody>
      <h1>Site Administration</h1>

      <p>
        Site administrators on precisionFDA are able to provide some services
        for users, including viewing account activations, resending activation
        emails, modifying user profiles, and granting account unlocks and
        multi-factor authentication resets. Additionally, site administrators
        are able to manually enable and disable accounts.
      </p>

      <h2 id="admin-dashboard">The Admin Dashboard</h2>

      <p>
        From the Admin Dashboard, accessible from the drop-down menu under the
        admin's name in the upper-right corner, an administrator may access
        statistics and lists of active, pending, and deactivated users.
      </p>

      <img width="100%" src={admindashboard} alt="Admin dashboard" />

      <h2 id="exploring-users">Exploring Active Users</h2>

      <p>
        Clicking on the “Active Users” button under Site Activity brings up a
        list of all active users, with additional tools to sort and filter the
        list.
      </p>

      <img width="100%" src={exploringusers1} alt="Active users list" />

      <p>
        At the top, the admin may filter by a specific date range, or can export
        the list to a downloaded CSV file.
      </p>

      <p>For each user, the following data is displayed:</p>
      <ul>
        <li>Their current level of data being stored</li>
        <li>Their average compute cost for the selected range</li>
        <li>Their data consumption for the selected range</li>
        <li>Their status (whether or not the user is logged in)</li>
        <li>Their total data consumption</li>
        <li>The org with which that user is affiliated</li>
        <li>The email address used by the user to sign up.</li>
      </ul>

      <p>
        Clicking on an individual user brings up additional information about
        that user's account.
      </p>

      <img
        width="100%"
        src={exploringusers2}
        alt="Additional user information"
      />

      <p>
        The administrator can, using the buttons available, reset the user’s
        multi-factor authentication, deactivate the user account, or unlock the
        user account if it has been locked. These actions will take effect when
        the user next logs in. Note that, if the account is not locked, the
        “Unlock” button will be grayed out.
      </p>

      <p>
        The administrator may also view the different objects and jobs performed
        by this user account. This includes viewing notes created by the user,
        discussions posted by the user, answers provided by the user, files
        uploaded by the user, comparisons run by the user, and applications
        created by the user.
      </p>

      <p>
        When deactivating a user, a prompt will pop up, asking the administrator
        to confirm the deactivation and, optionally, provide a reason for the
        deactivation.
      </p>

      <img
        width="100%"
        src={exploringusers3}
        alt="Deactivate user modal popup"
      />

      <h2 id="pending-users">Pending Users</h2>

      <p>
        Clicking on Pending Users from the Admin Dashboard brings up a list of
        all pending users - users for whom accounts have been provisioned, but
        have not yet been activated by the user. Here, the admin has the option
        to resend the activation email.
      </p>

      <img width="100%" src={pendingusers} alt="Pending users list" />

      <h2 id="deactivated-users">Deactivated Users</h2>

      <p>
        Clicking on Deactivated Users from the Admin Dashboard brings up a list
        of all deactivated users, with the option to reactivate the user
        profile. This will restore their permissions and original email address.
      </p>

      <img width="100%" src={deactivatedusers} alt="Deactivated users list" />
    </DocBody>
  )
}

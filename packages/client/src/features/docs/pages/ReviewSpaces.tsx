/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { DocBody } from '../styles'
import schema from '../images/schema.png'
import creating from '../images/creating.png'
import creating2 from '../images/creating2.png'
import testing from '../images/testing.png'
import confidential from '../images/confidential.png'
import cooperative from '../images/cooperative.png'
import transfer from '../images/transfer.png'
import workflowpublish1 from '../images/workflow_publish1.png'
import workflowpublish2 from '../images/workflow_publish2.png'
import workflowpublish3 from '../images/workflow_publish3.png'
import workflowpublish4 from '../images/workflow_publish4.png'
import workflowmoving1 from '../images/workflow_moving1.png'
import workflowmoving2 from '../images/workflow_moving2.png'
import { useScrollToHash } from '../../../hooks/useScrollToHash'

export const ReviewSpaces = () => {
  useScrollToHash()
  return (
    <DocBody>
      <h1>Review Spaces</h1>

      <p>
        <strong>Review spaces</strong> are custom environments on precisionFDA,
        designed to let two collaborating groups work cooperatively on a
        project.
      </p>

      <img
        width="100%"
        src={schema}
        alt="Review spaces schema with Sponsor-Private,Sponsor-Reviewer and Reviewer-Private areas"
      />

      <p>
        A <strong>review space</strong> provides two private areas - one for the
        reviewer, and one for the sponsor organization. Both groups also have
        access to a shared, cooperative space, where they may both interact with
        common files, run apps and examine jobs.
      </p>

      <h2 id="review-space-create">Creating the Review Space</h2>

      <p>
        To begin working with a sponsor org as a review lead, you will create a
        review space. You can start this by navigating to the Spaces area of the
        precisionFDA website from the top menu bar and selecting{' '}
        <strong>Provision a space</strong>.
      </p>

      <img width="100%" src={creating} alt="Spaces page overview" />

      <p>
        You must select <strong>review</strong> as the type of space.
      </p>

      <img
        width="100%"
        src={creating2}
        alt="Create new space page with Type,Name,Description,Reviewe lead,Sponsor Org and CTS fields"
      />

      <p>
        You can then provide a name for the space, a description, and a reviewer
        lead and sponsor org.
        <strong>The reviewer</strong> lead should be either yourself or the
        person leading the review, as their account will have permission to
        complete the space setup process.
        <strong>The sponsor org</strong> should be the organization whose work
        you are reviewing. You may also choose to load a template space that was
        used for app verification, if you choose to do so.
      </p>

      <img width="100%" src={testing} alt="Inactive Test review space" />

      <p>
        After creating the review space, both the reviewer lead and the sponsor
        org must accept the space. Both groups will receive an email prompting
        them to accept the space, and they must log in to precisionFDA to do so.
      </p>

      <h2 id="review-space-confidential">
        Using the Confidential Review Space
      </h2>

      <p>
        Once the review space has been accepted by both groups, it will
        activate, and both the review lead and the sponsor org administrator may
        log into their <strong>confidential spaces</strong>. From here, they may
        add files, apps, jobs and notes, and they may add other members to the
        space.
      </p>

      <img
        width="100%"
        src={confidential}
        alt="Active Confidential review space with Activity Summary and expanded filter options"
      />

      <p>
        To add data to a space, you can click on the{' '}
        <strong>Move data to space</strong> button located in the upper right
        hand corner. To invite other users to a space, you can click on the{' '}
        <strong>Members</strong> tab, located in the middle of the page, and add
        them by username. When adding new members, you may also set their
        permissions level for the space.
      </p>

      <h2 id="review-space-cooperative">Using the Cooperative Review Space</h2>

      <p>
        To access the shared, cooperative review space, you can click the link
        labeled <strong>To Cooperative</strong> in the upper left, next to the
        name of the review space.
      </p>

      <img
        width="100%"
        src={cooperative}
        alt="Navigation link to Cooperative review space above a Confidential review space"
      />

      <p>
        <strong>The cooperative space</strong> appears very similar to the
        private space, and includes all of the same features. You can add files,
        notes, assets, apps and jobs, and run apps in this space. Here, however,
        you’ll note that the members of both spaces have access - any data
        objects you add to this space can be accessed by both parties, so make
        sure you only add objects that you wish to share!
      </p>
      <p>
        To add data directly to the cooperative space, you can use the{' '}
        <strong>Move data to space</strong> button located in the upper right
        corner, just like in the private space.
      </p>
      <p>
        If you wish to transfer a data object from your private, confidential
        space to the shared, cooperative space, you may do so by going to the
        page of that data object.
      </p>

      <img
        width="100%"
        src={transfer}
        alt="Transferring data from private to cooperative space"
      />

      <p>
        If this data object does not currently exist in the cooperative space,
        you will see a green button labeled <strong>Copy to Cooperative</strong>
        . When you click this button, a copy of this data object will be created
        in the shared cooperative space. Once again, note that this action
        cannot be undone, so you will receive an <strong>Are you sure?</strong>{' '}
        prompt.
      </p>

      <h2 id="workflow-running">Running Workflows in Review Spaces</h2>

      <p>
        Similar to apps, workflows can be made available in group, verification,
        and review spaces. There are two methods for moving a workflow to a
        space: 1) publishing the workflow from the “Workflows” screen, or 2)
        moving the workflow to a space from the “Spaces” screen.
      </p>
      <p>
        Workflows cannot be removed from a space once added, so take caution
        when adding a workflow to a space. Additionally, once a workflow has
        been added to one space, it cannot be added to any other space. However,
        a workflow can be “forked” to create a new copy of the workflow that can
        optionally be modified and then added to another space if desired.
      </p>

      <h2 id="workflow-publishing">Publishing a Workflow</h2>

      <p>
        To publish a workflow, go to the workflows tab, select the workflow you
        would like to publish, and then select the ‘Publish’ button. An example
        is shown below.
      </p>

      <img
        width="100%"
        src={workflowpublish1}
        alt="Workflows tab overview with highlighted Publish button"
      />

      <p>
        Upon pressing ‘Publish’, the spaces you have available will appear as a
        set of selections. Find and choose the workspace that you would like to
        publish the workflow to. An example is shown below.
      </p>

      <img
        width="100%"
        src={workflowpublish2}
        alt="Dropdown list of spaces to Publish"
      />

      <p>
        This will take you to a page which will ask if you are willing to share
        the objects which are included in the workflow that is being published.
        If, for example, a component app was privately built by you, then you
        must check “share” to include all of the resources contained within that
        app. Alternatively, if the component object in your workflow is public,
        it will be automatically shared to the space. See the example case
        below.
      </p>

      <img
        width="100%"
        src={workflowpublish3}
        alt="Share workflow objects page"
      />

      <p>
        Once the ‘Share’ button has been checked, the resources contained in the
        object that will be shared will appear.
      </p>

      <img
        width="100%"
        src={workflowpublish4}
        alt="Shared object resources with checkbox selected for Shared option"
      />

      <p>
        After you’ve decided to share all of the data objects within the
        workflow, you may press 'Share select objects to “&lt;space name&gt;”'.
        The workflow will then be published to that space. Only public objects
        can be shared with cooperative spaces. Both public and private objects
        can be shared to confidential spaces.
      </p>

      <h2 id="workflow-moving">Moving a workflow</h2>

      <p>
        A workflow may also be added to a Space by clicking the “Move data to
        space…” button in the upper right corner, and selecting the workflow in
        the popup.
      </p>

      <img
        width="100%"
        src={workflowmoving1}
        alt="Move data to space page overview with Workflows tab selected"
      />

      <p>
        After the workflow has been added to the space, it is now runnable in
        the space, and can be accessed under the “Workflows” tab on the left
        side.
      </p>

      <img
        width="100%"
        src={workflowmoving2}
        alt="Workflows tab overview on Spaces page"
      />
      <br />
      <br />
      <br />
    </DocBody>
  )
}

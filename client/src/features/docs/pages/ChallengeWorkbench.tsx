/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { useScrollToHash } from '../../../hooks/useScrollToHash'
import create1 from '../images/create1.png'
import create2 from '../images/create2.png'
import edit1 from '../images/edit1.png'
import edit2 from '../images/edit2.png'
import phases from '../images/phases.png'
import { DocBody } from '../styles'

export const ChallengeWorkbench = () => {
  useScrollToHash()
  return (
    <DocBody>
      <h1>The Challenge Workbench</h1>
      <h2 id="challenge-new">Creating a New Challenge</h2>

      <p>
        For admins of the site, when going to the list of challenges, just above
        the list of previous challenges, there is a button to “Create a new
        challenge”. This will allow you to specify the basic information about a
        new challenge.
      </p>

      <img
        width="100%"
        src={create1}
        alt="Highlighted Create a new challenge button on Challenges page"
      />

      <p>
        This link will take you to the Challenge Creation Workbench, which
        includes several fields for setting up a new challenge.
      </p>

      <img width="100%" src={create2} alt="Create a new challenge page" />

      <ul>
        <li>Name: the title of the challenge and will appear in large font.</li>
        <li>
          Description: a short summary of the challenge that will appear under
          the title in the challenge banner.
        </li>
        <li>
          Scoring App User: the precisionFDA account of the user who will
          develop the scoring application. This can be your own username or the
          name of any user on the platform. You select the username from a
          dropdown list. You can jump to a specific user by typing the first few
          characters of their name.
        </li>
        <li>
          You can set a challenge start and end date and time, based on your
          local timezone.
        </li>
        <li>
          You can upload a “card image” from your local computer. This is the
          image that appears on the “card” for your challenge on the Challenges
          page.
        </li>
        <li>
          Status: one of setup, open, results_announced, paused, archived.
        </li>
      </ul>

      <h2 id="challenge-phases">Challenge Phases</h2>

      <p>
        When a challenge is first created, it is in the "setup" phase. In this
        phase, only admins and challenge admins will be able to see the
        challenge; other users will see no trace of the challenge. Any of the
        fields may be changed by going to the “Settings” of the challenge (which
        is only available to admins).
      </p>

      <p>
        Eventually, the admin can choose to move a challenge into the "open"
        phase. In this phase, users will be able to see the challenge page. The
        large challenge banner is displayed in the list of open challenges. At
        this time, the challenge info page is available to users. If the current
        time is within the challenge period set, submissions will be accepted.
      </p>

      <p>
        At any point while the challenge is open, an admin can place the
        challenge into the “paused” state. The challenge is still open, but the
        ability to submit is temporarily disabled.
      </p>

      <p>
        When the challenge is moved into the "results announced" phase, the
        challenge results tab becomes visible users.
      </p>

      <p>
        Finally, the challenge can be put into the "archived” phase, at which
        time the large challenge banner is removed. The challenge is still
        visible on a card under the “Previous PrecisionFDA Challenges” section
        of the Challenges page.
      </p>

      <img
        width="100%"
        src={phases}
        alt="Highlighted Settings button for an archived challenge on challenges page"
      />

      <p>
        Modifying the challenge page settings, phases, and card can all be done
        by clicking the “Settings” button nearby the challenge on the challenge
        site. Again, this feature is only accessible to admins on the site.
      </p>

      <h2 id="challenge-edit">Editing an Existing Challenge</h2>

      <p>
        When viewing a challenge page, you will be able to edit the content. The
        tool underlying this page editor is called ContentTools. There is much
        more complete documentation on how to use the ContentTools editor at{' '}
        <a href="http://getcontenttools.com/">getcontenttools</a>. To begin
        editing your challenge, under the “Challenges” tab, scroll down to your
        challenge and click “Edit Page”.
      </p>

      <img
        width="100%"
        src={edit1}
        alt="Highlighted Edit button for an archived challenge on challenges page"
      />

      <p>
        From here, there will be tabs to edit the challenges information,
        results, and resources. The results page won't be shown until a later
        time.
      </p>
      <p>
        To add images to your challenge pages, you will need to add the image as
        a resource. From the "Resources" tab, you can upload image files. After
        an image file is uploaded, a link will be generated that you can use to
        add that image to your challenge pages. The image processing may take a
        couple of minutes.
      </p>

      <img
        width="100%"
        src={edit2}
        alt="Available Resources for archived Challenge"
      />

      <p>
        You should ensure that the files related to the challenge are linked on
        the Challenge Intro page. It is usually best to link to the file's page,
        allowing users to generate their own download URLs.
      </p>

      <h2 id="challenge-develop-eval">Developing a Evaluation App</h2>

      <p>
        A key aspect of challenges is evaluating the results. The evaluation app
        should be carefully crafted to prevent leaking any information and
        attempt proper validation of all submissions.
      </p>
      <p>
        Before writing the challenge app, you will want to do some preparatory
        work. The inputs of the app are the files you are expecting in a
        submission. You will want to make an asset containing the answer key for
        comparison purposes. The outputs of the evaluation app should be some
        metrics that can be used to summarizing the results, often in the form
        of integers (ints) or floating point numbers (floats), and possibly a
        text report containing more detailed information about the results.
      </p>
      <p>
        When a user submits results, one of two things happens. If the challenge
        evaluation app succeeds, then the user will only know that their
        submission was successful. If the challenge evaluation app fails, then
        the user will be able to look at the log file of that failure. For this
        reason, it is important to write the validation part of the challenge
        evaluation app to be descriptive when it fails. Additionally, you will
        want to ensure that no data about the correct answers leak in the log.
      </p>
      <p>
        You should divide your app into two parts. The first part is validation,
        which does basic checks to make sure the submissions match an expected
        file format or output value. Sometimes, you are able to rely on third
        party tools to validate data (VCF validation is already performed by
        many tools). Other times you will have to write some custom code to do
        so (validating the file is in CSV format, for example). Ideally, you
        have some examples of submissions that should succeed and fail
        validation for testing purposes.
      </p>
      <p>
        The second part of your app will actually calculate the output metrics
        and evaluate the submission results. This can vary quite a bit depending
        on the nature of the challenge. Again, sometimes there are tools that
        can help (VCF comparisons), and other times you will have to write the
        code yourself. The metrics you care about should be saved into variables
        for output.
      </p>
      <p>
        It can useful to look at old challenge evaluation apps to get an idea of
        what to do. All old challenge evaluation apps are publicly available.
      </p>
      <p>For more on app development, see [App development documentation].</p>

      <h2 id="challenge-setting-eval">Setting the Challenge Evaluation App</h2>

      <p>
        The user configured as the “Scoring App User” must develop the app and
        publish it. Once the app is published, the user can click the “Assign to
        Challenge” button and click the name of your challenge. At this point,
        the app becomes the evaluator app for your challenge.
      </p>

      <h2 id="challenge-open">Opening a Challenge</h2>

      <p>
        Once the challenge intro page and challenge evaluation app are ready,
        you can transition the challenge to “open” through the challenge
        settings. At this time, users will be able to access the challenge info
        page.
      </p>
    </DocBody>
  )
}

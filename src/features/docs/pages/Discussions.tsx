/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { Link } from 'react-router-dom'
import { useScrollToHash } from '../../../hooks/useScrollToHash'
import { DocBody, DocRow, RightSide, PageMap } from '../styles'

export const Discussions = () => {
  useScrollToHash()
  return (
    <DocRow>
      <DocBody>
        <h1 id="discussions-new">Discussions</h1>

        <p>
          Inspired by the <Link to="/docs/notes">Notes</Link> feature,
          Discussions build a more communal experience by allowing precisionFDA
          users to pose discussion topics, and members of the community to
          juxtapose their answers.
        </p>
        <p>
          A discussion topic functions much like a note, in that it supports
          rich text formatting and attachments. Under each topic, each
          participants is allowed to post exactly one answer, also richly
          formatted and with attachments. This model of interaction encourages
          people to write a single answer as their thesis to the posed topic.
          Additional lightweight commenting is enabled on both the discussion
          topic and individual answers, so that the community can give quick
          feedback and further stimulate the discussion. Users can also upvote
          discussion topics or answers, to mark their interest and in some way
          help others prioritize what they read first.
        </p>
        <p>
          The Discussions section of the website lists all the discussions.
          Click on a topic to list all the answers. Click "Read answer" to see
          more details about an individual answer, or click "Join" to register
          your participation in the topic (even if you don't submit an answer).
          Click "Followers" to get a detailed list of users who have joined the
          discussion.
        </p>

        <h2>Creating a discussion</h2>

        <p>
          To create a new discussion, click "Start a discussion" under the
          Discussions section of the website. Enter a discussion title and fill
          in the rest of the content using{' '}
          <a href="https://jonschlinkert.github.io/remarkable/demo/">
            Markdown syntax
          </a>
          . You can save your edits even if you are not completely finished
          writing. Later, when you return to this topic, you can click "Edit
          discussion" to continue editing. To attach an item (such as a file, an
          app, a job, a comparison, or an asset), navigate to the page of that
          item and click "Attach to...", then select the discussion topic and
          click "Attach".
        </p>
        <p>
          The new discussion is initially private, and accessible only by you.
          Once you done editing and you have attached all items, click "Publish"
          to make the discussion public. The publishing wizard will guide you
          through the publication process, asking you if you'd like to publish
          the attached items. For more information, consult the{' '}
          <Link to="/docs/publishing">Publishing</Link> section.
        </p>

        <h2 id="discussions-answer">Writing an answer</h2>

        <p>
          To write an answer in a discussion, navigate to the discussion and
          click "Write an Answer". The process is similar to writing a note or a
          discussion: fill in your answer using{' '}
          <a href="https://jonschlinkert.github.io/remarkable/demo/">
            Markdown syntax
          </a>{' '}
          and click "Save" to record your changes; attach items by visiting an
          item and clicking "Attach to..."; and finally publish the answer by
          clicking "Publish".
        </p>
        <p>
          You can always revise your answer at any point, and manipulate its
          attachments. If at a later point you attach a private item to a public
          answer, you must make sure to separately publish the item, by visiting
          the item and clicking "Publish".
        </p>

        <h2 id="discussions-misc">Commenting &amp; upvoting</h2>

        <p>
          You can comment on any discussion or answer by clicking "Comment".
          Comments are displayed from oldest to most recent. Comments are meant
          to be short and thus do not support rich text formatting.
        </p>
        <p>
          You can also upvote any discussion or answer by clicking "Upvote".
          This will increase a counter of votes for that item. Votes can often
          help other community members prioritize what discussions or answers
          they read.
        </p>
      </DocBody>
      <RightSide>
        <PageMap>
          <li>
            <a href="#discussions-new" data-turbolinks="false">
              Creating a discussion
            </a>
          </li>
          <li>
            <a href="#discussions-answer" data-turbolinks="false">
              Writing an answer
            </a>
          </li>
          <li>
            <a href="#discussions-misc" data-turbolinks="false">
              Commenting & upvoting
            </a>
          </li>
        </PageMap>
      </RightSide>
    </DocRow>
  )
}

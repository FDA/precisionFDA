/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { Link } from 'react-router-dom'
import { useScrollToHash } from '../../../hooks/useScrollToHash'
import { DocBody, DocsTip, PageMap, RightSide, DocRow } from '../styles'

export const Notes = () => {
  useScrollToHash()
  return (
    <DocRow>
      <DocBody>
        <h1>Notes</h1>

        <p>
          The Notes section lets you write and publish rich notes describing
          your thoughts and your work; for example, you can discuss how you used
          files, comparisons, and apps&mdash;which you can also attach to the
          note&mdash;to prove a certain point or to document a procedure. You
          can read what others have reported and access their attachments to
          take a closer look at their work or even reproduce it on your own.
        </p>

        <p>
          Notes are listed as cards, with their title at the top, the author's
          organization handle and username at the bottom. If there are any
          attachments, the attached item counts are also displayed. The
          following icons are used to denote each collection:{' '}
          <span className="fa fa-files-o"> </span> = Files,{' '}
          <span className="fa fa-bullseye"> </span> = Comparisons,{' '}
          <span className="fa fa-tasks"> </span> = Jobs,{' '}
          <span className="fa fa-cubes"> </span> = Apps, and{' '}
          <span className="fa fa-file-archive-o"> </span> = Assets.
        </p>

        <p>
          Clicking on a note brings up the full note text. If the note has
          attachments, those are listed on the right hand side. Each attachment
          contains an icon to identify its type:{' '}
          <span className="fa fa-file-o"> </span> = File,{' '}
          <span className="fa fa-area-chart"> </span> = Comparison,{' '}
          <span className="fa fa-tasks"> </span> = Job,{' '}
          <span className="fa fa-cube"> </span> = App, and{' '}
          <span className="fa fa-file-archive-o"> </span> = Asset.
        </p>

        <h2 id="notes-edit">Editing notes</h2>

        <p>
          Notes are written using{' '}
          <a href="https://jonschlinkert.github.io/remarkable/demo/">
            Markdown syntax
          </a>
          . While editing a note, you can switch between editing the Markdown
          content and previewing the result. The editing mode also allows you to
          remove any attachments. When you are happy with your edits, click
          "Save" to store your changes.
        </p>

        <p>
          To attach an item (such as a file, an app, a job, a comparison, or an
          asset) to a note, navigate to the page of that item and click "Attach
          to...". A list of all the notes authored by you will pop up. Select
          one or more notes and click "Attach". If you attach a private item to
          a public note, the system <strong>does not</strong> adjust any
          permissions; you need to separately publish that item so that others
          can access it when they read your note.
        </p>

        <p>
          You don't need to own an item in order to attach it &mdash; you are
          welcome to attach other people's items to your notes. However, if they
          later delete one of these items, the attachment will be automatically
          removed.
        </p>

        <h2 id="notes-ideas">Ideas for using notes</h2>

        <p>
          Notes often function as a way to document information about their
          attachments. For that reason, when you visit the page of an item that
          has been attached to one or more notes, the system will show a "Notes"
          tab containing all related notes.
        </p>

        <p>
          When publishing items (like files or comparisons) to the precisionFDA
          community, it's a good idea to also publish a note describing why you
          are contributing these items and what you expect community members to
          do with them. This way, when someone stumbles upon a published item of
          yours, they can look up the relevant note to learn more. For more
          information, see <Link to="/docs/publishing">Publishing</Link>.
        </p>

        <DocsTip>
          ! <strong>TIP:</strong> Notes can also function as organizational
          structures, i.e. as "virtual folders" which contain the attached
          items. For example, you can create a "scrapbook" note and while
          browsing the rest of the website, if you come across an interesting
          item, attach it to your scrapbook.
        </DocsTip>

        <p>
          Tell us how you'd like this feature to evolve. Are you interested in
          the ability to comment on other people's notes? Would you care to
          "subscribe" to a note and get notifications when it changes? Should
          notes be collaboratively edited?{' '}
          <a href="mailto:precisionfda@fda.hhs.gov">Drop us a note</a> (no pun
          intended!) with your ideas and suggestions.
        </p>
      </DocBody>
      <RightSide>
        <PageMap>
          <li>
            <a href="#notes-edit" data-turbolinks="false">
              Editing notes
            </a>
          </li>
          <li>
            <a href="#notes-ideas" data-turbolinks="false">
              Ideas for using notes
            </a>
          </li>
        </PageMap>
      </RightSide>
    </DocRow>
  )
}

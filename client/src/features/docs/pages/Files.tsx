/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { Link } from 'react-router-dom'
import { useScrollToHash } from '../../../hooks/useScrollToHash'
import {
  DocBody,
  DocRow,
  DocsTip,
  DocTable,
  PageMap,
  RightSide,
} from '../styles'


export const Files = () => {
  useScrollToHash()
  return (
    <DocRow>
      <DocBody>
        <h1>Files</h1>
        <p>
          As with all systems, precisionFDA relies on files to store data. Files
          can be uploaded from your computer or generated by running apps, and
          can be shared with the precisionFDA community.
        </p>

        <h2 id="files-list">Listing files</h2>

        <p>
          Click on "My Home" at the top center of the page after login, the "Files"
          will show up on the top of the left pane. Files owned by you are shown under "My Files".
          Public precisionFDA members' contributions (including yours) are shown under "Everyone".
          You can further filter files by clicking on the "eye" icon, which will reveal a filter bar.
          For example, you can search on filename by entering a keyword in the "Name"
          field. Choose any filters and apply them by clicking on the "funnel" icon.
        </p>
        <p>
          The precisionFDA system also allows users to organize files into
          folders, putting similar files together. Click "Add folder" to create
          a new sub-folder in the current folder. This will prompt the you for
          the name of the new folder. Files can be moved into a folder by
          selecting them, clicking the "gear" button (top right), selecting
          "Move," and choosing the destination folder.
        </p>
        <p>
          Each file and folder has a checkbox on the left; checking it will
          select that file/folder. If an individual file is selected, you can
          rename the file. You can multiselect files/folders to perform an
          operation on all of them. With one or more file or folder selected,
          you can move the selected objects into another folder or publish the
          selected files and any files inside the folders you have selected. A
          dialog will pop up to confirm the files you have selected. You can
          also choose to delete these files, which will similarly show a
          confirmation dialog. Finally, you can choose to download these files,
          which will show a dialog allowing you to download each individual
          file. Due to the size of files, generating a tarball is not possible
          at this time.
        </p>

        <h2 id="files-uploading">Uploading files</h2>

        <p>
          You can upload small files directly from your web browser by clicking
          "Add files". Choose the files you want to upload, and click "Upload
          all" to begin the upload to cloud storage. To ensure integrity, your
          web browser will automatically calculate a checksum of the uploaded
          content and ensure that it matches the checksum calculated on the
          cloud side.
        </p>

        <p>
          Once the upload is complete, the system will perform some additional
          finalization. This process usually takes a few seconds, during which
          the file is in a "closing" state. After finalization is completed, the
          file becomes "closed" and can now be used within precisionFDA
          (downloaded, published, or provided as input in apps). Its contents
          can never be changed, and it is given a unique, immutable id of the
          form "file-Bk0kjkQ0ZP01x1KJqQyqJ7yq" to distinguish it across the
          whole site.
        </p>

        <p>
          If the upload gets interrupted for any reason, you will see the
          partially-uploaded file in your list of files, marked with an "open"
          state. Please delete the file and reupload it. Periodically, the
          precisionFDA system may automatically clean up partially uploaded
          files.
        </p>

        <DocsTip>
          <span className="fa fa-lightbulb-o" aria-hidden="true" />{' '}
          <strong>TIP:</strong> Web browsers have limitations with regards to
          their upload capabilities. Therefore, you should only use the
          browser-based method for small files. Read below for additional
          options if you have large data to upload.
        </DocsTip>

        <p>
          For large files that are accessible over the Internet, we suggest
          running the "Fetch file from URL" app, which has been provided by the
          precisionFDA team. The app allows you to fetch a file from a given
          URL.
        </p>

        <p>
          For large files that are on your computer, we suggest using the{' '}
          <strong>precisionFDA CLI</strong>, a command-line tool capable of
          uploading with multiple threads and more resilient to transient
          errors. The precisionFDA CLI can be used for both files and app
          assets, and it's available through the{' '}
          <Link to="/docs/cli">CLI docs</Link> page.
        </p>

        <p>
          Visit that page and download the precisionFDA CLI for your operating
          system and architecture by clicking the respective button under "Step
          3".
        </p>
        <p>
          The tool requires an "authorization key" in order to authenticate the
          client against the precisionFDA system. You can get a key by clicking
          the respective button under "Step 4" in the "Add Assets" page. Copy
          the key from that page and paste it in the command below where it says{' '}
          <strong>KEY</strong>. For your security, the key is valid for 24h.
        </p>
        <p>
          Run <code className="inline">./pfda upload-file --key KEY --file /path/to/file</code>.
          This command will upload the file to precisionFDA.
        </p>
        <DocsTip>
          <span className="fa fa-lightbulb-o" aria-hidden="true" />{' '}
          <strong>TIP:</strong> The CLI saves your key in{' '}
          <code>$HOME/.pfda_config</code>, so after you have run it once, you
          don't need to specify the key in subsequent invocations.
        </DocsTip>
        <p>
          The CLI can do a lot more than uploading assets, please see the{' '}
          <Link to="/docs/cli">Command Line Interface documentation page</Link>
        </p>

        <h2 id="files-origin">Examining file origin</h2>

        <p>
          The system automatically records the origin of files. The "origin"
          column describes how each file got introduced to precisionFDA; it is
          set to "Uploaded" if the file was directly uploaded; otherwise it
          points to a{' '}
          <Link
            to="/docs/apps#job-details"
            aria-label="Navigation to job details section in Apps module"
          >
            job
          </Link>{' '}
          if the file was generated by running an app. Further information can
          be obtained using the{' '}
          <Link to="/docs/tracking">tracking feature</Link>.
        </p>

        <h2 id="files-details">File details</h2>

        <p>
          Clicking on a filename in the files list (or on other file links that
          appear in certain precisionFDA areas) takes you to the file details
          page, which shows information such as filename, unique id, size,
          creation time, and origin. In addition, if the file has been used as
          input to any <Link to="/docs/comparisons">comparisons</Link> or has
          been attached to any <Link to="/docs/notes">notes</Link>, those will
          also be visible in respective sub-sections.
        </p>

        <p>
          This page shows one or more action buttons, depending on the file
          state and your permissions:
        </p>

        <DocTable>
          <thead>
            <tr>
              <th>Click...</th>
              <th>In order to...</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Attach to...</td>
              <td>
                Attach the file to a note. See the{' '}
                <Link to="/docs/notes">notes</Link> section for more info.
              </td>
            </tr>
            <tr>
              <td>Open</td>
              <td>
                Open the file inline in your browser (if your browser supports
                it). Use this action to see the content of text files, PDF
                files, images, etc.
              </td>
            </tr>
            <tr>
              <td>Download</td>
              <td>Download the file right away via your browser.</td>
            </tr>
            <tr>
              <td>Authorized URL</td>
              <td>
                Generate an authorized URL via which the file can be downloaded
                non-interactively.
              </td>
            </tr>
            <tr>
              <td>Track</td>
              <td>
                Display a graph tracking the file's provenance. See{' '}
                <Link to="/docs/tracking">Tracking</Link> for more info.
              </td>
            </tr>
            <tr>
              <td>Publish</td>
              <td>
                Publicly contribute the file to the precisionFDA community. See{' '}
                <Link to="/docs/publishing">Publishing</Link> for more info.
              </td>
            </tr>
            <tr>
              <td>Delete</td>
              <td>Permanently remove the file from precisionFDA.</td>
            </tr>
          </tbody>
        </DocTable>
      </DocBody>
      <RightSide>
        <PageMap>
          <li>
            <a href="#files-list" data-turbolinks="false">
              Listing files
            </a>
          </li>
          <li>
            <a href="#files-uploading" data-turbolinks="false">
              Uploading files
            </a>
          </li>
          <li>
            <a href="#files-origin" data-turbolinks="false">
              Examining file origin
            </a>
          </li>
          <li>
            <a href="#files-details" data-turbolinks="false">
              File details
            </a>
          </li>
        </PageMap>
      </RightSide>
    </DocRow>
  )
}
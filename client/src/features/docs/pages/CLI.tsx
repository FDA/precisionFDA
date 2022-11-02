/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { ButtonSolidBlue } from '../../../components/Button'
import {
  ButtonRow,
  DocBody,
  DocRow,
  DocsTip,
  PageMap,
  RightSide,
} from '../styles'
import { DownloadIcon } from '../../../components/icons/DownloadIcon'

export const CLI = () => (
  <DocRow>
    <DocBody>
      <h1>CLI</h1>

      <p>
        The precisionFDA CLI allows you to conveniently upload or download large
        files or assets to your home area or to a Space where you have access.
        You can also integrate this into your scripts to automate your workflow
        and do batch uploads and downloads.
      </p>

      <h2 id="download">Download the CLI</h2>

      <ButtonRow>
        <a
          href="https://pfda-production-static-files.s3.amazonaws.com/cli/pfda-linux-2.1.2.tar.gz"
          target="_blank"
          rel="noreferrer"
        >
          <ButtonSolidBlue>
            <DownloadIcon /> Linux
          </ButtonSolidBlue>
        </a>
        <a
          href="https://pfda-production-static-files.s3.amazonaws.com/cli/pfda-darwin-2.1.2.tar.gz"
          target="_blank"
          rel="noreferrer"
        >
          <ButtonSolidBlue>
            <DownloadIcon /> Mac OS X
          </ButtonSolidBlue>
        </a>
        <a
          href="https://pfda-production-static-files.s3.amazonaws.com/cli/pfda-windows-2.1.2.zip"
          target="_blank"
          rel="noreferrer"
        >
          <ButtonSolidBlue>
            <DownloadIcon /> Windows
          </ButtonSolidBlue>
        </a>
      </ButtonRow>

      <h2 id="authorization-key">Authorization Key</h2>

      <p>
        Visit the <a data-turbolinks="false" href="/assets/new">Create Assets</a> page and
        click on Generate Authorization Key button to generate a key that you
        will need when using the CLI.
      </p>

      <h2 id="uploading-files">Uploading Files</h2>

      <p>
        The CLI can be used to upload files to your My Home area or to a Space
        where you have access. Currently you can only upload single files and
        not a folder, but you can embed the command in a script to do batch
        uploads.
      </p>
      <p>
        To upload a file to your precisionFDA My Home
        <br />
        <code>./pfda upload-file --key KEY --file /path/to/file</code>
      </p>
      <p>
        To upload a file to a folder in your My Home area
        <br />
        <code>
          ./pfda upload-file --key KEY --file /path/to/file --folder-id
          FOLDER_ID
        </code>
      </p>
      <DocsTip>
        <span className="fa fa-lightbulb-o" aria-hidden="true" />{' '}
        <strong>TIP:</strong> To find FOLDER_ID, inspect the URL when browsing
        the contents of the target folder
      </DocsTip>
      <p>
        To upload a file to a Space
        <br />
        <code>
          ./pfda upload-file --key KEY --file /path/to/file --space-id SPACE_ID
        </code>
      </p>
      <p>
        To upload a file to a folder in a Space
        <br />
        <code>
          ./pfda upload-file --key KEY --file /path/to/file --folder-id
          FOLDER_ID --space-id SPACE_ID
        </code>
      </p>
      <DocsTip>
        <span className="fa fa-lightbulb-o" aria-hidden="true" />{' '}
        <strong>TIP:</strong> To find SPACE_ID, inspect the URL when browsing a
        Space.
        <br />
        For example, in the URL "https://precision.fda.gov/spaces/225/files",
        the Space ID is 225.
      </DocsTip>

      <h2 id="uploading-assets">Uploading Assets</h2>

      <p>
        To upload an asset to precisionFDA, prepare a folder path of the asset
        contents and a readme file, and run the following command with the
        desired asset name (must end in .tar or .tar.gz)
      </p>
      <p>
        <code>
          {
            './pfda upload-asset --key KEY --name NAME{.tar or .tar.gz} --root /PATH/TO/ROOT/FOLDER --readme README{.txt or .md}>'
          }
        </code>
      </p>

      <h2 id="downloading-files">Downloading Files</h2>

      <p>
        To download files from My Home or a Space, you simply need the unique id
        for the file which is of the form <code>file-ABCDEF1234567890-1</code>
      </p>
      <p>
        Download a file to the current directory using its original name
        <br />
        <code>./pfda download --key KEY --file-id FILE_ID</code>
      </p>
      <p>
        Download a file to the specified file path, ignoring its original name
        <br />
        <code>
          ./pfda download --key KEY --file-id FILE_ID --output
          /OUTPUT_PATH/DESIRED_FILENAME
        </code>
      </p>
      <p>
        Download a file to the specified output directory using its original
        name
        <br />
        <code>
          ./pfda download --key KEY --file-id FILE_ID --output /OUTPUT/PATH/
        </code>
      </p>
      <DocsTip>
        <span className="fa fa-lightbulb-o" aria-hidden="true" />{' '}
        <strong>NOTE:</strong> The trailing slash indicates a directory
      </DocsTip>
    </DocBody>
    <RightSide>
      <PageMap>
        <li>
          <a href="#download" data-turbolinks="false">Download the CLI</a>
        </li>
        <li>
          <a href="#authorization-key" data-turbolinks="false">Authorization Key</a>
        </li>
        <li>
          <a href="#uploading-files" data-turbolinks="false">Uploading Files</a>
        </li>
        <li>
          <a href="#uploading-assets" data-turbolinks="false">Uploading Assets</a>
        </li>
        <li>
          <a href="#downloading-files" data-turbolinks="false">Downloading Files</a>
        </li>
      </PageMap>
    </RightSide>
  </DocRow>
)

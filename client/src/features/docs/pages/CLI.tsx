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
        Additional features include advanced files listing from a given location,
        listing available spaces and describing entities like apps or workflows.
        You can also integrate this into your scripts to automate your workflow
        and do batch uploads and downloads.
      </p>

      <DocsTip>
        <span className="fa fa-lightbulb-o" aria-hidden="true" />{' '}
        <strong>TIP:</strong> Each CLI command has its own specific help section with various examples. <br/>
        Just add <code>--help</code> flag at the end of the command. Alias <code>-h</code> is also supported<br/>
        Example: <code>./pfda ls -help</code>
      </DocsTip>

      <h2 id="download">Download the CLI</h2>

      <ButtonRow>
        <a
          href="https://pfda-production-static-files.s3.amazonaws.com/cli/pfda-linux-2.2.tar.gz"
          target="_blank"
          rel="noreferrer"
        >
          <ButtonSolidBlue>
            <DownloadIcon /> Linux
          </ButtonSolidBlue>
        </a>
        <a
          href="https://pfda-production-static-files.s3.amazonaws.com/cli/pfda-darwin-2.2.tar.gz"
          target="_blank"
          rel="noreferrer"
        >
          <ButtonSolidBlue>
            <DownloadIcon /> Mac OS X
          </ButtonSolidBlue>
        </a>
        <a
          href="https://pfda-production-static-files.s3.amazonaws.com/cli/pfda-windows-2.2.zip"
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
        the contents of the target folder. <br />
        Another option is to list files in target location via CLI with ls command.
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
        <br />
        Another option is to list available spaces via CLI with list-spaces command.
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

      <h2 id="ls">Listing Files</h2>
      <p>
        To list all files in desired location. If no location provided, root of My Home will be listed.
        If you are interested in a specific Space or folder, provide the location via corresponding flag.
        There are also options to filter the results or present the response as JSON - ideal for scripting.
      </p>
      <p>
        List files from My Home
        <br />
        <code>./pfda ls --key KEY</code>
      </p>
      <p>
        List only files from My Home folder.
        <br />
        <code> ./pfda ls --key KEY --folder-id FOLDER_ID --files
        </code>
      </p>
      <p>
        List only folders from desired Space and present the results as JSON.
        <br />
        <code>
          ./pfda ls --key KEY --space-id SPACE_ID --folders --json
        </code>
      </p>

      <DocsTip>
        <span className="fa fa-lightbulb-o" aria-hidden="true" />{' '}
        <strong>TIP:</strong> You can also use <code>--brief</code> flag to list only ID and name!
      </DocsTip>

      <h2 id="list-spaces">Listing Spaces</h2>

      <p>
        To list all spaces available to you. By default only activated non-locked spaces are presented.
        There are also options to filter only certain types of spaces or spaces that are not activated yet.
      </p>
      <p>
        List all available spaces
        <br />
        <code>./pfda list-spaces --key KEY</code>
      </p>
      <p>
        List only spaces of type private or groups.
        <br />
        <code>./pfda list-spaces --key KEY --groups --private
        </code>
      </p>
      <p>
        List only unactivated spaces and present the result as JSON.
        <br />
        <code>
          ./pfda list-spaces --unactivated --json
        </code>
      </p>

      <h2 id="describe-app">Describing App</h2>
      <p>
        To show details about an app. You just need the unique id of the app which is of the form <code>app-ABCDEF1234567890-1</code>.
        The response is always JSON.
      </p>
      <p>
        Describe app.
        <br />
        <code>./pfda describe-app --key KEY --app-id APP_ID </code>
      </p>

      <h2 id="describe-workflow">Describing Workflow</h2>
      <p>
        To show details about a workflow. You just need the unique id of the workflow which is of the form <code>workflow-ABCDEF1234567890-1</code>.
        The response is always JSON.
      </p>
      <p>
        Describe workflow.
        <br />
        <code>./pfda describe-workflow --key KEY --workflow-id WORKFLOW_ID </code>
      </p>

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
        <li>
          <a href="#ls" data-turbolinks="false">Listing Files</a>
        </li>
        <li>
          <a href="#list-spaces" data-turbolinks="false">Listing Spaces</a>
        </li>
        <li>
          <a href="#describe-app" data-turbolinks="false">Describing App</a>
        </li>
        <li>
          <a href="#describe-workflow" data-turbolinks="false">Describing Workflow</a>
        </li>
      </PageMap>
    </RightSide>
  </DocRow>
)

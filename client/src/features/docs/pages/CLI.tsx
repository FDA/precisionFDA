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
import { useScrollToHash } from '../../../hooks/useScrollToHash'

export const CLI = () => {
  useScrollToHash()
  return (
    <DocRow>
      <DocBody>
        <h1>CLI</h1>

        <p>
          The precisionFDA CLI allows you to conveniently upload or download large
          files, folders or assets to your home area or to a Space where you have access.
          Additional features include folders creation and deletion, files deletion,
          advanced files listing from a given location, listing available spaces
          and describing entities like apps or workflows.
          You can also integrate this into your scripts to automate your workflow
          and do batch uploads and downloads.
        </p>

        <DocsTip>
          <span className="fa fa-lightbulb-o" aria-hidden="true" />{' '}
          <strong>TIP:</strong> Some of the CLI commands support <strong>wildcards</strong> in their arguments. <code>?</code> - 1 character, <code>*</code> - 0 or many characters.<br />
          Each CLI command has its own specific help section with various examples. <br />
          Just add <code>-help</code> flag at the end of the command. Alias <code>-h</code> is also supported.<br />
          Example: <code>./pfda ls -help</code>
        </DocsTip>

        <h2 id="download">Download the CLI</h2>

        <ButtonRow>
          <a
            href="https://pfda-production-static-files.s3.amazonaws.com/cli/pfda-linux-2.3.tar.gz"
            target="_blank"
            rel="noreferrer"
          >
            <ButtonSolidBlue>
              <DownloadIcon /> Linux
            </ButtonSolidBlue>
          </a>
          <a
            href="https://pfda-production-static-files.s3.amazonaws.com/cli/pfda-darwin-2.3.tar.gz"
            target="_blank"
            rel="noreferrer"
          >
            <ButtonSolidBlue>
              <DownloadIcon /> Mac OS X
            </ButtonSolidBlue>
          </a>
          <a
            href="https://pfda-production-static-files.s3.amazonaws.com/cli/pfda-windows-2.3.zip"
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
          Visit the{' '}
          <a data-turbolinks="false" href="/assets/new">
            Create Assets
          </a>{' '}
          page and click on Generate Authorization Key button to generate a key
          that you will need when using the CLI.
        </p>

        <h2 id="uploading-files">Uploading Files</h2>
        <p>
          The CLI can be used to upload files or folders to your My Home area or to a Space where you have access.
        </p>
        <p>
          To upload a file to your precisionFDA My Home
          <br />
          <code>./pfda upload-file /path/to/file -key KEY</code>
        </p>
        <p>
          To upload a file to a folder in your My Home area
          <br />
          <code>
            ./pfda upload-file /path/to/file -folder-id FOLDER_ID -key KEY
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
            ./pfda upload-file /path/to/file -space-id SPACE_ID -key KEY
          </code>
        </p>
        <p>
          To upload a file to a folder in a Space
          <br />
          <code>
            ./pfda upload-file /path/to/file -folder-id
            FOLDER_ID -space-id SPACE_ID -key KEY
          </code>
        </p>
        <DocsTip>
          <span className="fa fa-lightbulb-o" aria-hidden="true" />{' '}
          <strong>TIP:</strong> To find SPACE_ID, inspect the URL when browsing a
          Space.
          <br />
          For example, in the URL "https://precision.fda.gov/spaces/225/files" ,
          the Space ID is 225.
          <br />
          Another option is to list available spaces via CLI with list-spaces command.
        </DocsTip>
        <p>
          It works exactly the same for folder upload. Folder with identical name and content will be created in the target location.
          <br />
          <code>./pfda upload-file /path/to/folder/ -key KEY  </code>
        </p>
        <p>
          Uploading multiple files and folders
          <br />
          <code>./pfda upload-file /path/to/file1 /path/to/folder1 /path/to/file2 -key KEY</code>
        </p>
        <DocsTip>
          <span className="fa fa-lightbulb-o" aria-hidden="true" />{' '}
          <strong>NOTE:</strong> If you wish to upload multiple files/folders at once, <strong>they all have to be passed before any flag.</strong>
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
              './pfda upload-asset -name NAME{.tar or .tar.gz} -root /PATH/TO/ROOT/FOLDER -readme README{.txt or .md}> -key KEY'
            }
          </code>
        </p>

        <h2 id="downloading-files">Downloading Files</h2>

        <p>
          To download files from My Home or a Space, you simply need the unique id
          for the file which is of the form <code>file-ABCDEF1234567890-1</code> or its name.
          In case you need to download whole content of a folder, use -folder-id flag with integer id.
          To download files from public folders, use -public flag together with your command.
          Filename download supports wildcards, providing a handy way to download multiple files with just one command.
        </p>
        <p>
          Download a file by id to the current directory using its original name
          <br />
          <code>./pfda download FILE_ID -key KEY</code>
        </p>
        <p>
          Download a file by name to the current directory using its original name
          <br />
          <code>./pfda download FILE_NAME -key KEY</code>
        </p>
        <DocsTip>
          <span className="fa fa-lightbulb-o" aria-hidden="true" />{' '}
          <strong>NOTE:</strong>Filenames are not unique. There might be several files matching the same name in the target location.<br />
          In that case you will be offered a list of files matching the name to choose from.
        </DocsTip>
        <p>
          Download a file and preselect overwrite option if file with the same name already exists in the target location.
          <br />
          <code>./pfda download FILE_ID -overwrite true -key KEY</code>
        </p>
        <p>
          Download a file to the specified file path, ignoring its original name
          <br />
          <code>
            ./pfda download FILE_ID -output /OUTPUT_PATH/DESIRED_FILENAME -key KEY
          </code>
        </p>
        <p>
          Download a file to the specified output directory using its original name
          <br />
          <code>
            ./pfda download FILE_ID -output /OUTPUT/PATH/ -key KEY
          </code>
        </p>
        <DocsTip>
          <span className="fa fa-lightbulb-o" aria-hidden="true" />{' '}
          <strong>NOTE:</strong> The trailing slash indicates a directory. <br />
          The <code>-overwrite</code> option is useful for scripting to avoid dialog selection if file already exists. Only supports true|false. If you want to decide in the dialog, omit the flag completely.
        </DocsTip>
        <p>
          Download top-level folder content to the current directory using its original name.
          <br />
          <code>./pfda download -folder-id FOLDER_ID -key KEY</code>
        </p>
        <p>
          Download top-level public folder content to the current directory using its original name.
          <br />
          <code>./pfda download -folder-id FOLDER_ID -public -key KEY</code>
        </p>
        <p>
          Download whole folder content to the specified output directory
          <br />
          <code>./pfda download -folder-id FOLDER_ID -output /OUTPUT/PATH/ -recursive -key KEY</code>
        </p>

        <p>
          Download whole space folder content to the specified output directory
          <br />
          <code>./pfda download -space-id SPACE_ID -folder-id FOLDER_ID -output /OUTPUT/PATH/ -recursive -key KEY</code>
        </p>

        <p>
          Download top-level folder content that is a CSV file to the current directory
          <br />
          <code>./pfda download '*.csv' -folder-id FOLDER_ID -key KEY</code>
        </p>
        <p>
          Download top-level folder content that has 'file_' in their name to the current directory
          <br />
          <code>./pfda download 'file_*' -folder-id FOLDER_ID -key KEY</code>
        </p>

        <DocsTip>
          <span className="fa fa-lightbulb-o" aria-hidden="true" />{' '}
          <strong>NOTE:</strong>Download using filename also supports <strong>wildcards</strong>.
          If you wish to use wildcard download, put the argument in simple quotes to prevent shell character expansion.
        </DocsTip>

        <p>
          Download from the root folder of My Home or a Space. Since these have no folder-id, use <code>folder-id root</code>.
          <br />
          <code>./pfda download -folder-id root -key KEY </code>
          <br />
          <code>./pfda download -space-id SPACE_ID -folder-id root -key KEY </code>
        </p>

        <p>
          Download multiple files - you can combine file-ids and filenames but keep in mind filenames are not unique.
          Prefer file-ids whenever possible.
          <br />
          <code>./pfda download FILE_ID_1 FILE_ID_2 FILE_ID_3 -key KEY </code>
          <br />
          <code>./pfda download FILE_ID_1 FILENAME_1 FILE_ID_2 -key KEY </code>
        </p>

        <DocsTip>
          <span className="fa fa-lightbulb-o" aria-hidden="true" />{' '}
          <strong>NOTE:</strong> If you wish to download multiple files at once, <strong>they all have to be passed before any flag.</strong>
        </DocsTip>

        <h2 id="creating-folders">Creating Folders</h2>
        <p>
          To create a new folder, you only need the new name.
          If you wish to create the folder inside an already existing folder or space, use according flags to do so.
          Creating a new nested folders is allowed with -p (-parents) flag.
        </p>
        <p>
          Create a new folder in root of My Home
          <br />
          <code>./pfda mkdir FOLDER_NAME -key KEY</code>
        </p>

        <p>
          Create a new folder inside already existing folder inside of a space
          <br />
          <code>./pfda mkdir FOLDER_NAME -folder-id FOLDER_ID -space-id SPACE_ID -key KEY</code>
        </p>

        <p>
          Create a new nested folder structure
          <br />
          <code>./pfda mkdir FOLDER_NAME/FOLDER_NAME2/FOLDER_NAME3 -parents -key KEY </code>
        </p>

        <p>
          Create multiple new folders
          <br />
          <code>./pfda mkdir FOLDER_NAME1 FOLDER_NAME2 FOLDER_NAME3/FOLDER_NAME4 -parents -key KEY </code>
        </p>

        <DocsTip>
          <span className="fa fa-lightbulb-o" aria-hidden="true" />{' '}
          <strong>NOTE:</strong> If you wish to create multiple folders at once, <strong>they all have to be passed before any flag.</strong>
        </DocsTip>

        <h2 id="removing-folders">Removing Folders</h2>
        <p>
          To remove folders from My Home or a Space, you simply need the unique id
          for the folder which is a positive integer.
          Only empty folders are allowed to be removed - an error is raised otherwise.
          {/*You can force deletion of non-empty directory with -force flag.*/}
        </p>
        <strong>Please be cautious. This is a permanent destructive operation and cannot be undone.</strong>
        <p>
          Remove a folder by id
          <br />
          <code>./pfda rmdir FOLDER_ID -key KEY</code>
        </p>

        {/*<p>*/}
        {/*  Force remove non-empty directory*/}
        {/*  <br />*/}
        {/*  <code>./pfda rmdir FOLDER_ID -force -key KEY</code>*/}
        {/*</p>*/}

        <p>
          Remove multiple folders
          <br />
          <code>./pfda rmdir FOLDER_ID_1 FOLDER_ID_2 -key KEY </code>
        </p>

        <DocsTip>
          <span className="fa fa-lightbulb-o" aria-hidden="true" />{' '}
          <strong>NOTE:</strong> If you wish to remove multiple folders at once, <strong>they all have to be passed before any flag.</strong>
        </DocsTip>

        <h2 id="removing-files">Removing Files</h2>
        <p>
          To remove files from My Home or a Space, you simply need the unique id
          for the file which is of the form <code>file-ABCDEF1234567890-1</code> or its name.
          Removing by filename supports wildcards, providing a handy way to remove multiple files with just one command.
        </p>
        <strong>Please be cautious. This is a permanent destructive operation and cannot be undone.</strong>
        <p>
          Remove a file by id in root of My Home
          <br />
          <code>./pfda rm FILE_ID -key KEY</code>
        </p>
        <p>
          Remove a file by name in root of My Home
          <br />
          <code>./pfda rm FILE_NAME -key KEY</code>
        </p>
        <DocsTip>
          <span className="fa fa-lightbulb-o" aria-hidden="true" />{' '}
          <strong>NOTE:</strong>Filenames are not unique. There might be several files matching the same name in the target location.<br />
          In that case you will be offered a list of files matching the name to choose from.
        </DocsTip>

        <p>
          Remove all CSV files in the target folder
          <br />
          <code>./pfda rm '*.csv' -folder-id FOLDER_ID -key KEY</code>
        </p>
        <p>
          Remove all files that has 'file_' in their name in given space and folder
          <br />
          <code>./pfda rm 'file_*' -space-id SPACE_ID -folder-id FOLDER_ID -key KEY</code>
        </p>

        <DocsTip>
          <span className="fa fa-lightbulb-o" aria-hidden="true" />{' '}
          <strong>NOTE:</strong>Removing files using filename also supports <strong>wildcards</strong>. <code>?</code> - 1 character, <code>*</code> - 0 or many characters.<br />
          If you wish to use wildcard remove, put the argument in simple quotes to prevent shell character expansion.
          You will be prompted to confirm the action.
          {/*You can force the prompt using -force flag.*/}
        </DocsTip>

        <p>
          Remove multiple files - you can combine file-ids and filenames but keep in mind filenames are not unique.
          Prefer file-ids whenever possible.
          <br />
          <code>./pfda rm FILE_ID_1 FILE_ID_2 FILE_ID_3 -key KEY </code>
          <br />
          <code>./pfda rm FILE_ID_1 FILENAME_1 FILE_ID_2 -key KEY </code>
        </p>

        <DocsTip>
          <span className="fa fa-lightbulb-o" aria-hidden="true" />{' '}
          <strong>NOTE:</strong> If you wish to download multiple files at once, <strong>they all have to be passed before any flag.</strong>
        </DocsTip>

        <h2 id="ls">Listing Files</h2>
        <p>
          To list all files in desired location. If no location provided, root of My Home will be listed.
          By default, public files are not listed. To display public files, use -public flag.
          If you are interested in a specific Space or folder, provide the location via corresponding flag.
          There are also options to filter the results or present the response as JSON - ideal for scripting.
        </p>
        <p>
          List files from My Home
          <br />
          <code>./pfda ls -key KEY</code>
        </p>
        <p>
          List only files from My Home folder
          <br />
          <code> ./pfda ls -folder-id FOLDER_ID -files -key KEY
          </code>
        </p>
        <p>
          List only folders from desired Space and present the results as JSON
          <br />
          <code>
            ./pfda ls -space-id SPACE_ID -folders -json -key KEY
          </code>
        </p>
        <p>
          List from desired Space and folder
          <br />
          <code>
            ./pfda ls -space-id SPACE_ID -folder-id FOLDER_ID -key KEY
          </code>
        </p>

        <DocsTip>
          <span className="fa fa-lightbulb-o" aria-hidden="true" />{' '}
          <strong>TIP:</strong> You can also use <code>-brief</code> flag to list only ID and name.
        </DocsTip>

        <h2 id="print-content">Printing Content</h2>

        <p>
          To print content of a file there are two options available.
          You can print whole file content or just few first lines if that's all you need.
        </p>
        <p>
          Print whole file content
          <br />
          <code>./pfda cat FILE_ID -key KEY</code>
        </p>
        <p>
          Print first 10 lines of a file
          <br />
          <code>./pfda head FILE_ID -key KEY
          </code>
        </p>

        <h2 id="list-spaces">Listing Spaces</h2>

        <p>
          To list all spaces available to you. By default only activated non-locked spaces are presented.
          There are also options to filter only certain types of spaces or spaces that are not activated yet.
        </p>
        <p>
          List all available spaces
          <br />
          <code>./pfda list-spaces -key KEY</code>
        </p>
        <p>
          List only spaces of type private or groups
          <br />
          <code>./pfda list-spaces -groups -private -key KEY
          </code>
        </p>
        <p>
          List only unactivated spaces and present the result as JSON
          <br />
          <code> ./pfda list-spaces -unactivated -json -key KEY
          </code>
        </p>

        <h2 id="describe-app">Describing App</h2>
        <p>
          To show details about an app. You just need the unique id of the app which is of the form <code>app-ABCDEF1234567890-1</code>.
          The response is always JSON.
        </p>
        <p>
          Describe an app
          <br />
          <code>./pfda describe-app APP_ID -key KEY </code>
        </p>

        <h2 id="describe-workflow">Describing Workflow</h2>
        <p>
          To show details about a workflow. You just need the unique id of the workflow which is of the form <code>workflow-ABCDEF1234567890-1</code>.
          The response is always JSON.
        </p>
        <p>
          Describe a workflow
          <br />
          <code>./pfda describe-workflow WORKFLOW_ID -key KEY </code>
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
            <a href="#creating-folders" data-turbolinks="false">Creating Folders</a>
          </li>
          <li>
            <a href="#removing-folders" data-turbolinks="false">Removing Folders</a>
          </li>
          <li>
            <a href="#removing-files" data-turbolinks="false">Removing Files</a>
          </li>
          <li>
            <a href="#print-content" data-turbolinks="false">Printing Content</a>
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
}

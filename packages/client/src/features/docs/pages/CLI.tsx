/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import styled from 'styled-components'
import {
  ButtonRow,
  DocBody,
  DocRow,
  PageMap,
  RightSide,
} from '../styles'

import { DownloadIcon } from '../../../components/icons/DownloadIcon'
import { useScrollToHash } from '../../../hooks/useScrollToHash'
import { Button } from '../../../components/Button'

const HelpSection = styled.div`
  background-color: #d9edf7;
  border-radius: 5px;
  padding: 13px;
  position: relative;
  margin-bottom: 20px;

  &:before {
    height: 100%;
    width: 4px;
    content: "";
    background: #31708f;
    display: block;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
  }
`

const HelpTitle = styled.div`
  font-weight: bold;
  font-size: 1.2em;
  color: #31708f;
`

const HelpTip = styled.p`
  color: #31708f;
  margin-left: 5px;
`

const HelpTipText = styled.p`
  color: #31708f;
  margin-left: 10px;
`

const ExampleBlock = styled.div`
    margin-bottom: 10px;
    font-family: 'Courier New', Courier, monospace;

    .description {
        font-style: italic;
    }

    .command {
        background-color: #f4f4f4;
        color: #007bff;
        padding: 5px 10px;
        margin-top: 5px;
    }
`

const StyledCode = styled.code`
    background-color: #f4f4f4;
    color: #007bff;
    padding: 2px 4px;
    margin-top: 5px;
`

export const CLI = () => {
  useScrollToHash()
  return (
    <DocRow>
      <DocBody>
        <h1>precisionFDA CLI</h1>
        <p>
          With the precisionFDA CLI, you can easily manage your files, folders and assets on precisionFDA.
          You can both upload and download large data to and from your home area or a Space that you have access to.
          You can also create or delete folders and files, list files from a specific location, list available Spaces
          and describe entities like apps or workflows.
          Moreover, you can use the precisionFDA CLI in your scripts to automate your workflow and perform batch
          operations.
          The CLI is also preinstalled on the workstations provided by precisionFDA.
        </p>

        <h2 id="download">Download the CLI</h2>
        <ButtonRow>
          <a
            href="https://pfda-production-static-files.s3.amazonaws.com/cli/pfda-linux-2.7.1.tar.gz"
            target="_blank"
            rel="noreferrer"
          >
            <Button data-variant="primary">
              <DownloadIcon/> Linux
            </Button>
          </a>
          <a
            href="https://pfda-production-static-files.s3.amazonaws.com/cli/pfda-darwin-2.7.1.tar.gz"
            target="_blank"
            rel="noreferrer"
          >
            <Button data-variant="primary">
              <DownloadIcon/> Mac OS X
            </Button>
          </a>
          <a
            href="https://pfda-production-static-files.s3.amazonaws.com/cli/pfda-windows-2.7.1.zip"
            target="_blank"
            rel="noreferrer"
          >
            <Button data-variant="primary">
              <DownloadIcon/> Windows
            </Button>
          </a>
        </ButtonRow>

        <h2 id="authorization-key">Authorization Key</h2>

        To generate a key necessary for using the CLI, follow these steps in the application:
        <ul>
          <li>Click on your name in the top right corner of the app.</li>
          <li>From the submenu options, select 'Generate CLI Key' and copy the presented key.</li>
        </ul>

        Alternatively, visit the{' '}
        <a data-turbolinks="false" href="/home/assets">
          <strong>Assets</strong>
        </a>{' '}
        page and click on 'Generate CLI Key' button and copy the presented key.
        <br/>
        <div className={'text-danger'}><strong>Note:</strong> This does not apply to CLI usage on workstations, the key
          is already
          pre-generated for you in workstation's config.
        </div>
        <br/>
        <br/>

        <HelpSection>
          <HelpTitle>💡CLI Usage Tips</HelpTitle>
          <HelpTip><strong>Authorization Key:</strong></HelpTip>
          <HelpTipText>
            The CLI requires an authorization key to be passed with the first command you run
            using <StyledCode>-key</StyledCode> flag.<br/>
            After that, the key is stored in a config file and you don't have to pass it anymore.<br/>
            The key is valid for <strong>24 hours</strong>. If it expires, you will be prompted to generate a new one.
          </HelpTipText>
          <HelpTip><strong>Help Sections:</strong></HelpTip>
          <HelpTipText>
            Each CLI command has its specific help section with various examples.<br/>
            Just add either <strong><i>-help</i></strong> or <strong><i>-h</i></strong> flag at the end of the command.
            Example: <StyledCode>pfda ls -help</StyledCode>
          </HelpTipText>
          <HelpTip><strong>Wildcards:</strong></HelpTip>
          <HelpTipText>
            Some of the CLI commands support wildcards in their arguments. <br/>
            <StyledCode>?</StyledCode> - represents 1 character, <StyledCode>*</StyledCode> - represents 0 or many
            characters,
            example <StyledCode>pfda download '*.csv'</StyledCode> Check individual commands below to see more examples
            and learn more.<br/>
          </HelpTipText>
          <HelpTip><strong>Result Code:</strong></HelpTip>
          <HelpTipText>
            All CLI commands follow the same result code pattern.<br/>
            If the command is successful, it exits with code <strong>0</strong>.<br/>
            If an error occurs, the error message is printed to stdout and the command exits with
            code <strong>1</strong>.
          </HelpTipText>
          <HelpTip><strong>Result Format:</strong></HelpTip>
          <HelpTipText>
            Some CLI commands support result response in JSON format. Simply append <StyledCode>-json</StyledCode> flag
            to the command.<br/>
            If an error occurs, it results with JSON object with one key, <strong>"error"</strong>.
          </HelpTipText>

        </HelpSection>

        <h2 id="uploading-files">Uploading Files & Folders</h2>
        <p>
          The CLI command <StyledCode>pfda upload-file</StyledCode> is designed for uploading files or folders into a
          specific location.
          By default, files are uploaded to the root of the My Home area. The command supports uploading multiple
          files or folders,
          and also allows uploads via stdin (piped input).
        </p>

        <h3>Usage</h3>
        <StyledCode>{' ./pfda upload-file <PATH/TO/FILE> [...FLAG] '}</StyledCode>

        <h3>Available Flags</h3>
        <p>
          All flags are optional. They can be used to specify the upload location or the name of the file (in case of
          stdin input).
        </p>
        <ul>
          <li><StyledCode>-h, -help</StyledCode>: Displays the help message and exit.</li>
          <li><StyledCode>-space-id &lt;ID&gt;</StyledCode>: Uploads the file to the specified space.</li>
          <li><StyledCode>-folder-id &lt;ID&gt;</StyledCode>: Uploads the file to the specified folder.</li>
          <li><StyledCode>-name &lt;NAME&gt;</StyledCode>: Specifies the name of a stdin file. Required for stdin input.
          </li>
          <li><StyledCode>-json</StyledCode>: Responds the command result in JSON format.</li>
          <li><StyledCode>-threads</StyledCode>: Changes number of upload threads to spawn per file (Max 100). Consider
            memory usage.
          </li>
          <li><StyledCode>-chunksize</StyledCode>: Changes size of each upload chunk in bytes (Min 16MB, Max 4GB).
            Consider memory usage.
          </li>
        </ul>

        <h3>Examples</h3>
        <p>
          The following examples demonstrate various use cases for the <StyledCode>upload-file</StyledCode> command:
        </p>

        <ExampleBlock>
          <div className="description">
            # Uploads 'script01.py' to the root folder of My Home.
          </div>
          <code className="command">
            ./pfda upload-file script01.py
          </code>
        </ExampleBlock>

        <ExampleBlock>
          <div className="description">
            # Uploads to the root folder of a specified space.
          </div>
          <code className="command">
            ./pfda upload-file script01.py -space-id 1995
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Uploads to the specified folder in My Home.
          </div>
          <code className="command">
            ./pfda upload-file script01.py -folder-id 2704
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Uploads the folder and its content to the specified folder.
          </div>
          <code className="command">
            ./pfda upload-file data_folder/ -folder-id 2704
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Uploads multiple files to the specified folder.
          </div>
          <code className="command">
            ./pfda upload-file script01.py info/readme.txt data_folder/ -folder-id 2704
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Uploads multiple files to the specified space.
          </div>
          <code className="command">
            ./pfda upload-file script01.py parser.py validator.py -space-id 1995
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Uploads a file provided via stdin with the specified name.
          </div>
          <code className="command">
            ./pfda upload-file -name piped_file.csv
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Uploads 'script01.py' to the root folder of My Home and responds with JSON result.
          </div>
          <code className="command">
            ./pfda upload-file script01.py -json
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Uploads large file 'data.sql' to the root folder of My Home with manually set chunksize and upload
            threads.
          </div>
          <code className="command">
            ./pfda upload-file script01.py -threads 20 -chunksize 134217728
          </code>
        </ExampleBlock>

        <HelpSection>
          <HelpTitle>💡Tips and Notes</HelpTitle>
          <HelpTip><strong>Finding FOLDER ID or SPACE ID:</strong></HelpTip>
          <HelpTipText>
            To find FOLDER_ID or SPACE_ID, inspect the URL when browsing the contents of a target folder or space. <br/>
            For example, in the URL <strong>"https://precision.fda.gov/spaces/1995/files"</strong>, the Space ID
            is <strong>1995</strong>.<br/>
            For example, in the URL <strong>"https://precision.fda.gov/home/files?folder_id=2704"</strong>, the Folder
            ID is <strong>2704</strong>.<br/>
            You can also use the precisionFDA CLI command <StyledCode>ls -folders</StyledCode> to list folders in
            specified location.
            You can also use the precisionFDA CLI command <StyledCode>list-spaces</StyledCode> to list available spaces
            you can upload the file to.
          </HelpTipText>
          <HelpTip><strong>Uploading multiple items:</strong></HelpTip>
          <HelpTipText>
            When uploading multiple files and/or folders, ensure they are all passed as arguments before any flags.
          </HelpTipText>
          <HelpTip><strong>Optimizing uploads:</strong></HelpTip>
          <HelpTipText>
            The <StyledCode>{'-threads'}</StyledCode> and <StyledCode>{'-chunksize'}</StyledCode> flags are useful for
            optimizing uploads.
            Increasing the number of threads can speed up the process, but be mindful of memory usage.
            Similarly, increasing the chunk size can reduce the number of API calls, though this also impacts memory
            usage.
            These values are not controlled and if you decide to use them, you might run into <strong>OutOfMemory
            errors</strong> on the host machine.
            The default values are 10 threads and 64MB chunk size.
          </HelpTipText>
        </HelpSection>

        <h2 id="uploading-assets">Uploading Assets</h2>
        <p>
          The CLI command <StyledCode>pfda upload-asset</StyledCode> is designed for uploading an asset to precisionFDA.
          You need to prepare a folder with the asset contents, and a readme file. The folder can contain any files and
          subfolders.
          The readme file name must end in <StyledCode>.md</StyledCode> or <StyledCode>.txt</StyledCode>.
          Similarly, the desired asset name must end
          in <StyledCode>.tar</StyledCode> or <StyledCode>.tar.gz</StyledCode>.
        </p>

        <h3>Usage</h3>
        <StyledCode> {'./pfda upload-asset -name <ASSET_NAME> -root <PATH/TO/ROOT> -readme <README_FILE> [...FLAG]'}</StyledCode>

        <h3>Available Flags</h3>
        <p>
          All flags are optional. They can be used to specify result format.
        </p>
        <ul>
          <li><StyledCode>-h, -help</StyledCode>: Displays the help message and exit.</li>
          <li><StyledCode>-json</StyledCode>: Responds the command result in JSON format.</li>
        </ul>

        <h3>Example</h3>
        <p>
          The following example demonstrates use case for the <StyledCode>upload-asset</StyledCode> command:
        </p>

        <ExampleBlock>
          <div className="description">
            # Uploads 'my_assets.tar.gz' to the Assets root folder of My Home.
          </div>
          <code className="command">
            ./pfda upload-asset -name my_assets.tar.gz -root ./local_assets -readme ./readme.md
          </code>
        </ExampleBlock>

        <h2 id="downloading-files">Downloading Files</h2>

        <p>
          The CLI command <StyledCode>pfda download</StyledCode> is designed for downloading files from My Home or a
          Space. You simply need the unique file id or its name.
          In case you need to download the whole content of a folder,
          use <StyledCode>-folder-id &lt;ID&gt;</StyledCode> flag with integer id.
          To download files from public folders, use <StyledCode>-public</StyledCode> flag together with your command.
          Filename download supports wildcards, providing a handy way to download multiple files with just one command.
        </p>

        <h3>Usage</h3>
        <StyledCode>{' ./pfda download <FILE_ID | FILE_NAME> [...FLAG] '}</StyledCode>

        <h3>Available Flags</h3>
        <p>
          All flags are optional. They can be used to specify the download location or the name of the file.
        </p>
        <ul>
          <li><StyledCode>-h, -help</StyledCode>: Displays the help message and exit.</li>
          <li><StyledCode>-output &lt;PATH&gt;</StyledCode>: Downloads to given path.</li>
          <li><StyledCode>-space-id &lt;ID&gt;</StyledCode>: Downloads from the specified space.</li>
          <li><StyledCode>-folder-id &lt;ID&gt;</StyledCode>: Download from the specified folder.</li>
          <li><StyledCode>-public</StyledCode>: Download from public folder, must specify -folder-id &lt;ID&gt;.
          </li>
          <li><StyledCode>-overwrite &lt;true|false&gt;</StyledCode>: Preselects overwrite option for dialog if path
            already exists.
          </li>
          <li><StyledCode>-recursive</StyledCode>: Recursively downloads content of selected folder.</li>
          <li><StyledCode>-json</StyledCode>: Responds the command result in JSON format.</li>
        </ul>

        <h3>Examples</h3>
        <p>
          The following examples demonstrate various use cases for the <StyledCode>download</StyledCode> command:
        </p>

        <ExampleBlock>
          <div className="description">
            # Downloads file by id to the current directory
          </div>
          <code className="command">
            ./pfda download file-GJk1kpQ05xgQd8bP54kJFjzkz-1
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Downloads file by name to the current directory
          </div>
          <code className="command">
            ./pfda download data_01.csv
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Downloads file and preselect overwrite option if a file with the same name already exists in the target
            location.
          </div>
          <code className="command">
            ./pfda download file-GJk1kpQ05xgQd8bP54kJFjzkz-1 -overwrite true
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Downloads file to the specified file path with a new name.
          </div>
          <code className="command">
            ./pfda download file-GJk1kpQ05xgQd8bP54kJFjzkz-1 -output ./results/data_final.csv
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Downloads file to the specified output directory using its original name
          </div>
          <code className="command">
            ./pfda download file-GJk1kpQ05xgQd8bP54kJFjzkz-1 -output ./results
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Downloads top-level My Home folder content to the current directory.
          </div>
          <code className="command">
            ./pfda download -folder-id 2704
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Downloads top-level public folder content to the current directory.
          </div>
          <code className="command">
            ./pfda download -folder-id 2704 -public
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Downloads whole folder content to the specified output directory.
          </div>
          <code className="command">
            ./pfda download -folder-id 2704 -output ./data_dump -recursive
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Downloads whole space folder content to the specified output directory.
          </div>
          <code className="command">
            ./pfda download -space-id 1995 -folder-id 2704 -output ./data_dump -recursive
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Downloads top-level folder content that is a CSV file to the current directory.
          </div>
          <code className="command">
            ./pfda download '*.csv' -folder-id 2704
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Downloads top-level folder content prefixed with 'res_' to the current directory.
          </div>
          <code className="command">
            ./pfda download 'res_*' -folder-id 2704
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Downloads content from the root folder of My Home - has no valid folder-id.
          </div>
          <code className="command">
            ./pfda download -folder-id root
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Downloads from the root folder of the Space - has no valid folder-id.
          </div>
          <code className={'command'}>
            ./pfda download -space-id 1995 -folder-id root
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Downloads multiple files - combine file-ids and filenames.
          </div>
          <code className={'command'}>
            ./pfda download file-GJk1kpQ05xgQd8bP54kJFjzkz-1 intro.pdf file-YZm9QpQ0b69Qd8bP454kmcf76-2
          </code>
        </ExampleBlock>

        <HelpSection>
          <HelpTitle>💡Tips and Notes</HelpTitle>
          <HelpTip><strong>Finding FOLDER ID or SPACE ID:</strong></HelpTip>
          <HelpTipText>
            To find FOLDER_ID or SPACE_ID, inspect the URL when browsing the contents of a target folder or space. <br/>
            For example, in the URL <strong>"https://precision.fda.gov/spaces/1995/files"</strong>, the Space ID
            is <strong>1995</strong>. <br/>
            For example, in the URL <strong>"https://precision.fda.gov/home/files?folder_id=2704"</strong>, the Folder
            ID is <strong>2704</strong>.<br/>
            You can also use the precisionFDA CLI command <StyledCode>ls -folders</StyledCode> to list folders in a
            specified location.
            You can also use the precisionFDA CLI command <StyledCode>list-spaces</StyledCode> to list available spaces
            you can upload the file to.
          </HelpTipText>
          <HelpTip><strong>Download by name:</strong></HelpTip>
          <HelpTipText>
            Filenames are not unique. There might be several files matching the same name in the target location.
            In that case you will be offered a list of files matching the name to choose from. To avoid such problems,
            prefer file-id whenever possible.
          </HelpTipText>
          <HelpTip><strong>Wildcards:</strong></HelpTip>
          <HelpTipText>
            Download using filename also supports wildcards. If you wish to use wildcard download, put the argument in
            simple quotes to prevent shell character expansion.
          </HelpTipText>
          <HelpTip><strong>Downloading multiple items:</strong></HelpTip>
          <HelpTipText>
            When downloading multiple files, ensure they are all passed as arguments before any flags.
          </HelpTipText>
          <HelpTip><strong>Scripting:</strong></HelpTip>
          <HelpTipText>
            The <StyledCode>{'-overwrite <true|false>'}</StyledCode> flag is useful for scripting to avoid dialog
            selection if file already exists. If you want to decide in the dialog, omit the flag completely.
          </HelpTipText>
        </HelpSection>


        <h2 id="creating-folders">Creating Folders</h2>
        <p>
          The CLI command <StyledCode>pfda mkdir</StyledCode> is designed for creating new folders. It allows for the
          creation of folders within My Home or specified spaces and folders.
          The command supports the creation of nested folder structures and multiple folders simultaneously.
          Creating a new nested folder structure is allowed with the <StyledCode>-parents</StyledCode> flag.
          To create a new folder, you only need the desired name. If you wish to create the folder inside an already
          existing folder or space, use according flags to do so.
        </p>


        <h3>Usage</h3>
        <StyledCode>{' ./pfda mkdir <FOLDER_NAME> [...FLAG] '}</StyledCode>

        <h3>Available Flags</h3>
        <p>
          All flags are optional. They can be used to specify the target location.
        </p>
        <ul>
          <li><StyledCode>-h, -help</StyledCode>: Displays the help message and exit.</li>
          <li><StyledCode>-space-id &lt;ID&gt;</StyledCode>: Creates the folder in the specified space.</li>
          <li><StyledCode>-folder-id &lt;ID&gt;</StyledCode>: Creates the folder in the specified folder.</li>
          <li><StyledCode>-p, -parents</StyledCode>: Creates parent directories as needed, no error if existing.</li>
          <li><StyledCode>-json</StyledCode>: Responds the command result in JSON format.</li>
        </ul>

        <h3>Examples</h3>
        <p>
          The following examples demonstrate various use cases for the <StyledCode>mkdir</StyledCode> command:
        </p>

        <ExampleBlock>
          <div className="description">
            # Creates new folder named DATA in your My Home section.
          </div>
          <code className="command">
            ./pfda mkdir DATA
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Creates new folder named DATA in the root of the space.
          </div>
          <code className={'command'}>
            ./pfda mkdir DATA -space-id 1995
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Creates 3 new folders in the specified folder.
          </div>
          <code className={'command'}>
            ./pfda mkdir DATA scripts results -folder-id 2704
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Creates the specified nested folder structure.
          </div>
          <code className={'command'}>
            ./pfda mkdir scripts/python/v1 scripts/python/v2 -p
          </code>
        </ExampleBlock>


        <HelpSection>
          <HelpTitle>💡Tips and Notes</HelpTitle>
          <HelpTip><strong>Finding FOLDER ID or SPACE ID:</strong></HelpTip>
          <HelpTipText>
            To find FOLDER_ID or SPACE_ID, inspect the URL when browsing the contents of a target folder or space. <br/>
            For example, in the URL <strong>"https://precision.fda.gov/spaces/1995/files"</strong>, the Space ID
            is <strong>1995</strong>. <br/>
            For example, in the URL <strong>"https://precision.fda.gov/home/files?folder_id=2704"</strong>, the Folder
            ID is <strong>2704</strong>.<br/>
            You can also use the precisionFDA CLI command <StyledCode>ls -folders</StyledCode> to list folders in
            specified location.
            You can also use the precisionFDA CLI command <StyledCode>list-spaces</StyledCode> to list available spaces
            you can upload the file to.
          </HelpTipText>
          <HelpTip><strong>Creating multiple items:</strong></HelpTip>
          <HelpTipText>
            When creating multiple folders, ensure they are all passed as arguments before any flags.
          </HelpTipText>
        </HelpSection>


        <h2 id="removing-folders">Removing Folders</h2>
        <p>
          The CLI command <StyledCode>pfda rmdir</StyledCode> is designed for removing folders from My Home or a
          Space. <br/>
          All you need is the unique folder ID. For safety reasons only empty folders are allowed to be removed. <br/>
        </p>
        <strong>Please be cautious. This is a permanent destructive operation and cannot be undone.</strong>

        <h3>Usage</h3>
        <StyledCode>{' ./pfda rmdir <FOLDER_ID> [...FLAG] '}</StyledCode>

        <h3>Available Flags</h3>
        <p>
          All flags are optional.
        </p>
        <ul>
          <li><StyledCode>-h, -help</StyledCode>: Displays the help message and exit.</li>
          <li><StyledCode>-json</StyledCode>: Responds the command result in JSON format.</li>
        </ul>

        <h3>Examples</h3>
        <p>
          The following examples demonstrate various use cases for the <StyledCode>rmdir</StyledCode> command:
        </p>

        <ExampleBlock>
          <div className="description">
            # Removes a folder by id
          </div>
          <code className={'command'}>
            ./pfda rmdir 2704
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Removes multiple folders
          </div>
          <code className={'command'}>
            ./pfda rmdir 2704 3404 4504
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Removes a folder by id and responds with JSON result
          </div>
          <code className={'command'}>
            ./pfda rmdir 2704 -json
          </code>
        </ExampleBlock>

        <HelpSection>
          <HelpTitle>💡Tips and Notes</HelpTitle>
          <HelpTip><strong>Finding FOLDER ID:</strong></HelpTip>
          <HelpTipText>
            To find FOLDER_ID, inspect the URL when browsing the contents of a target folder or space. <br/>
            For example, in the URL <strong>"https://precision.fda.gov/home/files?folder_id=2704"</strong>, the Folder
            ID is <strong>2704</strong>.<br/>
            You can also use the precisionFDA CLI command <StyledCode>ls -folders</StyledCode> to list folders in
            specified location.
          </HelpTipText>
          <HelpTip><strong>Deleting multiple folders:</strong></HelpTip>
          <HelpTipText>
            When deleting multiple folders, ensure all their ids are passed as arguments before any flags.
          </HelpTipText>
        </HelpSection>

        <h2 id="removing-files">Removing Files</h2>
        <p>
          The CLI command <StyledCode>pfda rm</StyledCode> is designed for removing files from My Home or a Space. <br/>
          You simply need the unique id for the file which is of the
          form <StyledCode>file-ABCDEF1234567890-1</StyledCode> or its name. <br/>
          Removing by filename supports wildcards, providing a handy way to remove multiple files with just one command.
        </p>
        <strong>Please be cautious. This is a permanent destructive operation and cannot be undone.</strong>

        <h3>Usage</h3>
        <StyledCode>{' ./pfda rm <FILE_ID | FILE_NAME> [...FLAG] '}</StyledCode>

        <h3>Available Flags</h3>
        <p>
          All flags are optional. They can be used to specify the target location.
        </p>
        <ul>
          <li><StyledCode>-h, -help</StyledCode>: Displays the help message and exit.</li>
          <li><StyledCode>-space-id &lt;ID&gt;</StyledCode>: Executes in the specified space.</li>
          <li><StyledCode>-folder-id &lt;ID&gt;</StyledCode>: Executes in the specified folder.</li>
          <li><StyledCode>-json</StyledCode>: Responds the command result in JSON format.</li>
        </ul>

        <h3>Examples</h3>
        <p>
          The following examples demonstrate various use cases for the <StyledCode>rm</StyledCode> command:
        </p>
        <ExampleBlock>
          <div className="description">
            # Removes a file by id
          </div>
          <code className="command">
            ./pfda rm file-GJk1kpQ05xgQd8bP54kJFjzkz-1
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Removes a file by name in root of My Home
          </div>
          <code className="command">
            ./pfda rm intro.pdf
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Removes all CSV files in the target folder
          </div>
          <code className="command">
            ./pfda rm '*.csv' -folder-id 2704
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Removes all files that have 'res_' in their name in the target space and folder
          </div>
          <code className="command">
            ./pfda rm 'res_*' -space-id 1995 -folder-id 2704
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Removes multiple files - combine file-ids and filenames.
          </div>
          <code className={'command'}>
            ./pfda rm file-GJk1kpQ05xgQd8bP54kJFjzkz-1 intro.pdf file-YZm9QpQ0b69Qd8bP454kmcf76-2
          </code>
        </ExampleBlock>

        <HelpSection>
          <HelpTitle>💡Tips and Notes</HelpTitle>
          <HelpTip><strong>Finding FOLDER ID or SPACE ID:</strong></HelpTip>
          <HelpTipText>
            To find FOLDER_ID or SPACE_ID, inspect the URL when browsing the contents of a target folder or space. <br/>
            For example, in the URL <strong>"https://precision.fda.gov/spaces/1995/files"</strong>, the Space ID
            is <strong>1995</strong>. <br/>
            For example, in the URL <strong>"https://precision.fda.gov/home/files?folder_id=2704"</strong>, the Folder
            ID is <strong>2704</strong>.<br/>
            You can also use the precisionFDA CLI command <StyledCode>ls -folders</StyledCode> to list folders in
            specified location.
            You can also use the precisionFDA CLI command <StyledCode>list-spaces</StyledCode> to list available spaces
            you can upload the file to.
          </HelpTipText>
          <HelpTip><strong>Remove by name:</strong></HelpTip>
          <HelpTipText>
            Filenames are not unique. There might be several files matching the same name in the target location.
            In that case, you will be offered a list of files matching the name to choose from. To avoid such problems,
            prefer file-id whenever possible.
          </HelpTipText>
          <HelpTip><strong>Wildcards:</strong></HelpTip>
          <HelpTipText>
            Deleting using filename also supports wildcards. If you wish to use wildcard remove, put the argument in
            single quotes to prevent shell character expansion.
          </HelpTipText>
          <HelpTip><strong>Removing multiple items:</strong></HelpTip>
          <HelpTipText>
            When removing multiple files, ensure they are all passed as arguments before any flags.
          </HelpTipText>
        </HelpSection>

        <h2 id="ls">Listing Files</h2>
        <p>
          The CLI command <StyledCode>pfda ls</StyledCode> is designed for listing files in a given location.
          If no location is provided, the root of My Home will be listed.
          By default, public files are not listed. To display public files, use <StyledCode>-public</StyledCode> flag.
          If you are interested in a specific Space or folder, provide the location via corresponding flag.
          There are also options to filter files or folders only.
        </p>

        <h3>Usage</h3>
        <StyledCode>{' ./pfda ls [...FLAG] '}</StyledCode>

        <h3>Available Flags</h3>
        <p>
          All flags are optional. They can be used to specify the target location or to filter the result.
        </p>
        <ul>
          <li><StyledCode>-h, -help</StyledCode>: Displays the help message and exit.</li>
          <li><StyledCode>-space-id &lt;ID&gt;</StyledCode>: Executes in the specified space.</li>
          <li><StyledCode>-folder-id &lt;ID&gt;</StyledCode>: Executes in the specified folder.</li>
          <li><StyledCode>-brief</StyledCode>: Displays a brief version of the response.</li>
          <li><StyledCode>-folders</StyledCode>: Displays only folders.</li>
          <li><StyledCode>-files</StyledCode>: Displays only files.</li>
          <li><StyledCode>-public</StyledCode>: Displays only public files & folders.</li>
          <li><StyledCode>-json</StyledCode>: Responds the command result in JSON format.</li>
        </ul>

        <h3>Examples</h3>
        <p>
          The following examples demonstrate various use cases for the <StyledCode>ls</StyledCode> command:
        </p>
        <ExampleBlock>
          <div className="description">
            # Lists files from My Home
          </div>
          <code className="command">
            ./pfda ls
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Lists only files from My Home folder
          </div>
          <code className="command">
            ./pfda ls -folder-id 2704 -files
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Lists only folders from desired Space and present the results as JSON
          </div>
          <code className="command">
            ./pfda ls -space-id 1995 -folders -json
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Lists from desired Space and folder
          </div>
          <code className="command">
            ./pfda ls -space-id 1995 -folder-id 2704
          </code>
        </ExampleBlock>

        <HelpSection>
          <HelpTitle>💡Tips and Notes</HelpTitle>
          <HelpTip><strong>Finding FOLDER ID or SPACE ID:</strong></HelpTip>
          <HelpTipText>
            To find FOLDER_ID or SPACE_ID, inspect the URL when browsing the contents of a target folder or space. <br/>
            For example, in the URL <strong>"https://precision.fda.gov/spaces/1995/files"</strong>, the Space ID
            is <strong>1995</strong>. <br/>
            For example, in the URL <strong>"https://precision.fda.gov/home/files?folder_id=2704"</strong>, the Folder
            ID is <strong>2704</strong>.<br/>
            You can also use the precisionFDA CLI command <StyledCode>ls -folders</StyledCode> to list folders in
            specified location.
            You can also use the precisionFDA CLI command <StyledCode>list-spaces</StyledCode> to list available spaces
            you can upload the file to.
          </HelpTipText>
          <HelpTip><strong>Brief response:</strong></HelpTip>
          <HelpTipText>You can also use <StyledCode>-brief</StyledCode> flag to list only ID and name.</HelpTipText>
        </HelpSection>

        <h2 id="ls-assets">Listing Assets</h2>
        <p>
          The CLI command <StyledCode>pfda ls-assets</StyledCode> is designed for listing assets in a given location.
          If no location is provided, 'My Home' is used by default.
          By default, public assets are not listed. To display them, use <StyledCode>-public</StyledCode> flag.
          The command always responds in JSON format.
        </p>

        <h3>Usage</h3>
        <StyledCode>{' ./pfda ls-assets [FLAG...]'}</StyledCode>

        <h3>Available Flags</h3>
        <p>All flags are optional and can be used to specify the assets to list.</p>
        <ul>
          <li><StyledCode>-h, -help</StyledCode>: Displays the help message and exits.</li>
          <li><StyledCode>-public</StyledCode>: Lists public assets.</li>
        </ul>

        <h3>Examples</h3>
        <p>The following examples demonstrate various use cases for the <StyledCode>ls-assets</StyledCode> command:</p>
        <ExampleBlock>
          <div className="description">
            # Lists all assets in your 'My Home'
          </div>
          <code className="command">
            ./pfda ls-assets
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Lists all public assets accessible to the user
          </div>
          <code className="command">
            ./pfda ls-assets -public
          </code>
        </ExampleBlock>

        <h2 id="ls-apps">Listing Applications</h2>
        <p>
          The CLI command <StyledCode>pfda ls-apps</StyledCode> is designed for listing applications in a given
          location.
          If no location is provided, 'My Home' is used by default.
          By default, public applications are not listed. To display them, use <StyledCode>-public</StyledCode> flag.
          The command always responds in JSON format.
        </p>

        <h3>Usage</h3>
        <StyledCode>{' ./pfda ls-apps [FLAG...]'}</StyledCode>

        <h3>Available Flags</h3>
        <p>All flags are optional and can be used to specify the applications to list.</p>
        <ul>
          <li><StyledCode>-h, -help</StyledCode>: Displays the help message and exits.</li>
          <li><StyledCode>-public</StyledCode>: Lists public applications.</li>
          <li><StyledCode>-space-id &lt;ID&gt;</StyledCode>: Lists applications in the specified space.</li>
        </ul>

        <h3>Examples</h3>
        <p>The following examples demonstrate various use cases for the <StyledCode>ls-apps</StyledCode> command:</p>
        <ExampleBlock>
          <div className="description">
            # Lists all applications from the space with id 24
          </div>
          <code className="command">
            ./pfda ls-apps -space-id 24
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Lists all applications in your 'My Home'
          </div>
          <code className="command">
            ./pfda ls-apps
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Lists all public applications accessible to the user
          </div>
          <code className="command">
            ./pfda ls-apps -public
          </code>
        </ExampleBlock>

        <h2 id="ls-discussions">Listing Discussions</h2>
        <p>
          The CLI command <StyledCode>pfda ls-discussions</StyledCode> is designed for listing discussions in a given
          location. The command always responds in JSON format.
        </p>

        <h3>Usage</h3>
        <StyledCode>{ './pfda ls-discussions [FLAG...]'}</StyledCode>

        <h3>Available Flags</h3>
        <p>All flags are optional and can be used to specify the discussions to list.</p>
        <ul>
          <li><StyledCode>-h, -help</StyledCode>: Displays the help message and exits.</li>
          <li><StyledCode>-space-id &lt;ID&gt;</StyledCode>: Lists discussions in the specified space.</li>
        </ul>

        <h3>Examples</h3>
        <p>The following example demonstrate use case for the <StyledCode>ls-discussions</StyledCode> command:</p>
        <ExampleBlock>
          <div className="description">
            # Lists all discussions from the space with id 24
          </div>
          <code className="command">
            ./pfda ls-discussions -space-id 24
          </code>
        </ExampleBlock>


        <h2 id="ls-executions">Listing Executions</h2>
        <p>
          The CLI command <StyledCode>pfda ls-executions</StyledCode> is designed for listing executions in a given
          location.
          If no location is provided, 'My Home' is used by default.
          By default, public executions are not listed. To display them, use <StyledCode>-public</StyledCode> flag.
          The command always responds in JSON format.
        </p>

        <h3>Usage</h3>
        <StyledCode>{' ./pfda ls-executions [FLAG...]'}</StyledCode>

        <h3>Available Flags</h3>
        <p>All flags are optional and can be used to specify the executions to list.</p>
        <ul>
          <li><StyledCode>-h, -help</StyledCode>: Displays the help message and exits.</li>
          <li><StyledCode>-public</StyledCode>: Lists public executions.</li>
          <li><StyledCode>-space-id &lt;ID&gt;</StyledCode>: Lists executions in the specified space.</li>
        </ul>

        <h3>Examples</h3>
        <p>The following examples demonstrate various use cases for the <StyledCode>ls-executions</StyledCode> command:
        </p>
        <ExampleBlock>
          <div className="description">
            # Lists all executions in your 'My Home'
          </div>
          <code className="command">
            ./pfda ls-executions
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Lists all executions from the space with id 24
          </div>
          <code className="command">
            ./pfda ls-executions -space-id 24
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Lists all public executions accessible to the user
          </div>
          <code className="command">
            ./pfda ls-executions -public
          </code>
        </ExampleBlock>

        <h2 id="ls-spaces">Listing Spaces</h2>
        <p>
          The CLI command <StyledCode>pfda ls-spaces</StyledCode> is designed to list all spaces available to you. By
          default only activated non-locked spaces are presented.
          There are also options to filter only certain types of spaces or spaces that are not activated yet.
        </p>


        <h3>Usage</h3>
        <StyledCode>{' ./pfda ls-spaces [...FLAG] '}</StyledCode>

        <h3>Available Flags</h3>
        <p>
          All flags are optional. They can be used to specify the target location.
        </p>
        <ul>
          <li><StyledCode>-h, -help</StyledCode>: Displays the help message and exit.</li>
          <li><StyledCode>-locked</StyledCode>: Shows only locked spaces.</li>
          <li><StyledCode>-unactivated</StyledCode>: Shows only unactivated spaces.</li>
          <li><StyledCode>-review</StyledCode>: Shows only review spaces.</li>
          <li><StyledCode>-groups</StyledCode>: Shows only groups spaces.</li>
          <li><StyledCode>-private</StyledCode>: Shows only private spaces.</li>
          <li><StyledCode>-administrator</StyledCode>: Shows only administrator spaces.</li>
          <li><StyledCode>-government</StyledCode>: Shows only government spaces.</li>
          <li><StyledCode>-json</StyledCode>: Responds the command result in JSON format.</li>
        </ul>

        <h3>Examples</h3>
        <p>
          The following examples demonstrate various use cases for the <StyledCode>list-spaces</StyledCode> command:
        </p>
        <ExampleBlock>
          <div className="description">
            # Lists all available spaces
          </div>
          <code className="command">
            ./pfda ls-spaces
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Lists only spaces of type private or groups
          </div>
          <code className="command">
            ./pfda ls-spaces -groups -private
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Lists only unactivated spaces and present the result as JSON
          </div>
          <code className="command">
            ./pfda ls-spaces -unactivated -json
          </code>
        </ExampleBlock>

        <h2 id="ls-members">Listing Space Members</h2>
        <p>
          The CLI command <StyledCode>pfda ls-members</StyledCode> is designed for listing members in a given space.
        </p>

        <h3>Usage</h3>
        <StyledCode>{' ./pfda ls-members [FLAG...]'}</StyledCode>

        <h3>Available Flags</h3>
        <p>All flags are optional and can be used to specify the members to list.</p>
        <ul>
          <li><StyledCode>-h, -help</StyledCode>: Displays the help message and exits.</li>
          <li><StyledCode>-space-id &lt;ID&gt;</StyledCode>: Lists members in the specified space.</li>
          <li><StyledCode>-json</StyledCode>: Responds the command result in JSON format.</li>
        </ul>

        <h3>Examples</h3>
        <p>The following examples demonstrate various use cases for the <StyledCode>ls-members</StyledCode> command:</p>
        <ExampleBlock>
          <div className="description">
            # Lists all members from the space with id 24
          </div>
          <code className="command">
            ./pfda ls-members -space-id 24
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Lists all members from the space with id 24 in JSON format
          </div>
          <code className="command">
            ./pfda ls-members -space-id 24 -json
          </code>
        </ExampleBlock>

        <h2 id="describe">Describing Entities</h2>
        <p>
          The CLI command <StyledCode>pfda describe</StyledCode> is designed to display details about any entity.<br/>
          All you need is the unique entity ID. It is of the
          form <StyledCode>{'{entity}-ABCDEF1234567890-{number}'}</StyledCode>. <br/>
          Supported types are: app, asset, discussion, file, execution and workflow.
          The response is always in JSON format.
        </p>

        <h3>Usage</h3>
        <StyledCode>{' ./pfda describe <ENTITY_ID> '}</StyledCode>

        <h3>Available Flags</h3>
        <p>
          All flags are optional.
        </p>
        <ul>
          <li><StyledCode>-h, -help</StyledCode>: Displays the help message and exit.</li>
        </ul>

        <h3>Example</h3>
        <p>
          The following examples demonstrate use cases for the <StyledCode>describe</StyledCode> command:
        </p>

        <ExampleBlock>
          <div className="description">
            # Describes an app
          </div>
          <code className="command">
            ./pfda describe app-GZfKXJ80GGYZKxQQGpz7KX2p-1
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Describes an execution
          </div>
          <code className="command">
            ./pfda describe job-GZg92X80Z0gx903yy68z8YPk-1
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Describes a workflow
          </div>
          <code className="command">
            ./pfda describe worfklow-GZq2qY80Z0gjx7qJQ9GJyF8v-1
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Describes a file
          </div>
          <code className="command">
            ./pfda describe file-GJk1kpQ05xgQd8bP54kJFjzkz-4
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Describes an asset
          </div>
          <code className="command">
            ./pfda describe file-GZYY1pQ05xgQd8bP54kJFFX7a-1
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Describes a discussion
          </div>
          <code className="command">
            ./pfda describe discussion-17
          </code>
        </ExampleBlock>

        <h2 id="get-scope">Getting Scope</h2>
        <p>
          The CLI command <StyledCode>pfda get-scope</StyledCode> is designed to print the current scope.<br/>
          If you are running it in a private scope, 'private' is printed to the console.
          In case you are in a space, only the integer Space ID is printed to the console.
        </p>

        <h3>Usage</h3>
        <StyledCode>{' ./pfda get-scope [...FLAG] '}</StyledCode>

        <h3>Available Flags</h3>
        <p>
          All flags are optional.
        </p>
        <ul>
          <li><StyledCode>-h, -help</StyledCode>: Displays the help message and exit.</li>
          <li><StyledCode>-json</StyledCode>: Responds the command result in JSON format.</li>
        </ul>

        <h3>Example</h3>
        <p>
          The following example demonstrates use case for the <StyledCode>get-scope</StyledCode> command:
        </p>
        <ExampleBlock>
          <div className="description">
            # Get scope of the current workstation's context
          </div>
          <code className="command">
            ./pfda get-scope
          </code>
        </ExampleBlock>

        <h2 id="print-content">Printing Content</h2>
        <p>
          The CLI commands <StyledCode>pfda cat</StyledCode> and <StyledCode>pfda head</StyledCode> are designed to
          print the content of a file.
          They only accept a single parameter - the unique file ID.
          You can print whole file content or just a few first lines if that's all you need.
        </p>

        <h3>Available Flags</h3>
        <p>
          All flags are optional. They can be used to specify the number of lines to print.
        </p>
        <ul>
          <li><StyledCode>-h, -help</StyledCode>: Displays the help message and exit.</li>
          <li><StyledCode>-lines</StyledCode>: Alters number of lines to display. (head command only)</li>
        </ul>

        <h3>Examples</h3>
        <p>
          The following examples demonstrate use cases for
          the <StyledCode>cat</StyledCode> and <StyledCode>head</StyledCode> command:
        </p>

        <ExampleBlock>
          <div className="description">
            # Prints whole file content
          </div>
          <code className="command">
            ./pfda cat file-GJk1kpQ05xgQd8bP54kJFjzkz-1
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Prints first 10 lines of a file
          </div>
          <code className="command">
            ./pfda head file-GJk1kpQ05xgQd8bP54kJFjzkz-1
          </code>
        </ExampleBlock>
        <ExampleBlock>
          <div className="description">
            # Prints first 30 lines of a file
          </div>
          <code className="command">
            ./pfda head file-GJk1kpQ05xgQd8bP54kJFjzkz-1 -lines 30
          </code>
        </ExampleBlock>


        <hr/>
        <h2 id="changelog">pFDA CLI Changelog</h2>
        <br/>

        <p>Version 2.7.1 (05/31/2024): ls shows files and folders in all states </p>
        <p>Version 2.7.0 (05/16/2024): Fixed file-upload bug, various improvements </p>
        <p>Version 2.6.0 (04/02/2024): New features: describe, ls-assets, ls-apps, ls-executions, ls-workflows, ls-discussions </p>
        <p>Version 2.5.0 (12/14/2023): Support of JSON responses, upload-file bug fixes.</p>
        <p>Version 2.4.1 (07/20/2023): Fixed folder id manipulation.</p>
        <p>Version 2.4 (05/25/2023): New features: get-space-id, upload-file stdin input.</p>
        <p>Version 2.3 (03/08/2023): New features: mkdir, rm, rmdir, head, tail.</p>
        <p>Version 2.2.1 (12/20/2022): ls output improvements, added -overwrite flag for download.</p>
        <p>Version 2.2 (12/07/2022): New features: ls, list-space, describe-app, describe-workflow.</p>
        <p>Version 2.1.2 (8/03/2022): Fixed windows asset upload.</p>
        <p>Version 2.1.1 (7/18/2022): Improvements to asset upload.</p>
        <p>Version 2.1 (2/22/2022): Added download feature, upload to space, -cmd flag is now optional.</p>
        <p>Version 2.0.1 (8/26/2021): Fix an issue uploading very large files.</p>
        <p>Version 2.0.0 (6/21/2018): TLS 1.2 and FIPS 140-2 support.</p>
        <p>Version 1.0.4 (1/5/2016): Reduced memory usage of each thread.</p>
        <p>Version 1.0.3 (12/14/2015): The uploader can now be used for both assets and files.</p>
        <p>Version 1.0.2 (12/3/2015): Multi-threaded uploading, for faster uploading of large assets.</p>


      </DocBody>
      <RightSide>
        <PageMap>
          <li><a href="#download" data-turbolinks="false">Download the CLI</a></li>
          <li><a href="#authorization-key" data-turbolinks="false">Authorization Key</a></li>
          <li><a href="#uploading-files" data-turbolinks="false">Uploading Files</a></li>
          <li><a href="#uploading-assets" data-turbolinks="false">Uploading Assets</a></li>
          <li><a href="#downloading-files" data-turbolinks="false">Downloading Files</a></li>
          <li><a href="#creating-folders" data-turbolinks="false">Creating Folders</a></li>
          <li><a href="#removing-folders" data-turbolinks="false">Removing Folders</a></li>
          <li><a href="#removing-files" data-turbolinks="false">Removing Files</a></li>
          <li><a href="#ls" data-turbolinks="false">Listing Files</a></li>
          <li><a href="#ls-apps" data-turbolinks="false">Listing Apps</a></li>
          <li><a href="#ls-assets" data-turbolinks="false">Listing Assets</a></li>
          <li><a href="#ls-discussions" data-turbolinks="false">Listing Discussions</a></li>
          <li><a href="#ls-executions" data-turbolinks="false">Listing Executions</a></li>
          <li><a href="#ls-spaces" data-turbolinks="false">Listing Spaces</a></li>
          <li><a href="#ls-members" data-turbolinks="false">Listing Space Members</a></li>
          <li><a href="#ls-workflows" data-turbolinks="false">Listing Workflows</a></li>
          <li><a href="#describe" data-turbolinks="false">Describing Entities</a></li>
          <li><a href="#get-scope" data-turbolinks="false">Getting Scope</a></li>
          <li><a href="#print-content" data-turbolinks="false">Printing Content</a></li>
          <li><a href="#changelog" data-turbolinks="false">Changelog</a></li>
        </PageMap>
      </RightSide>
    </DocRow>
  )
}

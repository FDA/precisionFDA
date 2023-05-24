/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { Link } from 'react-router-dom'

import { useScrollToHash } from '../../../hooks/useScrollToHash'
import { OutdatedDocs } from '../common'
import runningworkstation from '../images/running_workstation.png'
import { DocBody, DocRow, PageMap, RightSide } from '../styles'

export const Workstations = () => {
  useScrollToHash()
  return (
    <DocRow>
      <DocBody>
        <OutdatedDocs />
        <h1>Workstation Apps</h1>

        <p>
          Workstations are a class of apps on precisionFDA that are
          "interactive". Most apps on precisionFDA are non-interactive: you
          provide inputs, the app follows a set script, and creates outputs if
          it finishes successfully. Workstations are interactive; they create an
          environment where the user may enter any command they choose.
        </p>

        <h2 id="workstation-types">Workstation Types</h2>

        <p>There are currently two types of Workstations on precisionFDA:</p>
        <p>
          1) <strong>TTYD</strong> - this Workstation provides an Ubuntu
          command-line terminal interface.
        </p>
        <p>
          2) <strong>JupyterLab</strong> - this Workstation provides a
          JupyterLab server graphical interface. The Jupyter interface supports
          running Python or R notebooks, as well as a built-in terminal.
        </p>

        <h2 id="workstation-access">Access to Workstations</h2>

        <p>
          In order to run a Workstation, your account needs additional
          authorization. You can request Workstations authorization by sending
          an email to precisionFDA Support (precisionfda-support@dnanexus.com).
        </p>
        <p>
          If you do not have authorization, you will receive an error message
          when you click "Run" on a Workstation app.
        </p>

        <h2 id="workstation-launching">Launching a Workstation</h2>

        <p>
          Workstations may be found in the public Apps repository, similar to
          other apps.
        </p>
        <p>Here are links to current Workstations:</p>
        <p>
          <a href="https://precision.fda.gov/home/apps/app-G1gY2BQ0KJ893JfK3jBYP2v5-1">
            TTYD Workstation, for command line access
          </a>
        </p>
        <p>
          <a href="https://precision.fda.gov/home/apps/app-G1gY5900XgB9pFq87g5bgz92-1">
            JupyterLab Workstation, for creating and running Jupyter notebooks
          </a>
        </p>
        <p>
          When you launch a Workstation, it will take 2-5 minutes for the worker
          to initialize. Once the Execution page states that the execution is
          "Running", you may access the Workstation. A link will appear in the
          middle of the page, labeled "Open."
        </p>

        <img
          width="100%"
          src={runningworkstation}
          alt="Running Workstation page"
        />

        <p>
          Clicking on this "Open" link will open the Workstation in a new tab,
          bringing up a terminal interface (<strong>TTYD</strong> Workstation)
          or the Jupyter interface (<strong>JupyterLab</strong> Workstation).
        </p>
        <h2 id="workstation-accessing">
          Accessing files and data on Workstations
        </h2>

        <p>
          When you run a Workstation, you have full admin access on the worker,
          as well as unrestricted internet access.
        </p>
        <p>You may install packages with "sudo pip" or "sudo apt-get".</p>
        <p>
          <code>sudo apt-get install pigz</code>
        </p>
        <p>You may install Python packages with pip.</p>
        <p>
          <code>sudo pip install numpy</code>
        </p>
        <p>You may download any public-facing file with wget.</p>
        <p>
          <code>
            wget
            http://www.usadellab.org/cms/uploads/supplementary/Trimmomatic/Trimmomatic-0.36.zip
          </code>
        </p>
        <p>You can pull GitHub repositories with Git.</p>
        <p>
          <code>git clone https://github.com/lh3/bwa.git</code>
        </p>

        <h4 id="workstation-accessing-pfda">Accessing data on precisionFDA</h4>

        <p>
          Workstations have full access to your private files in your
          precisionFDA cloud environment. You can interact with these files
          using <code>pFDA CLI</code> commands.
        </p>
        <p>
          <code>./pfda ls</code> will show all files on your private precisionFDA
          area.
        </p>
        <p>
          <code>./pfda download {'<$file-id>'}</code> will download a file from
          precisionFDA to the local worker. You may also use filename instead but it might not be unique.
        </p>
        <p>
          <code>./pfda upload-file {'<$filename>'}</code> will upload a file from the
          local worker to your precisionFDA private area.
        </p>

        <p>
          To learn more about pFDA CLI capabilities,
          please check our dedicated {' '}
          <Link to="cli">
            CLI docs
          </Link>{' '} page.
        </p>


        <h2 id="workstation-snapshots">Creating snapshots on Workstations</h2>

        <p>
          Workstations support the ability to create a snapshot, which takes a
          picture of all modifications to the Workstation since it was launched
          and can be seen as a "save point". The snapshot action creates a
          tarball that contains all modified files, which is placed in a user's
          precisionFDA private area as a *.snapshot data object.
        </p>
        <p>
          After a snapshot file is created, a new execution of a Workstation may
          be launched, with the snapshot data object as an optional input. If a
          snapshot is provided as input, it will be unpacked on the worker
          instance and all files will be placed in the locations where they were
          located when the snapshot was created.
        </p>
        <p>
          To take a snapshot in the TTYD Workstation, navigate to the execution
          page and click on the "Snapshot" button. You'll be given a default name
          that you can override, and an option to terminate the workstation once
          the snapshot has been created.
        </p>
        <p>
          To take a snapshot with the JupyterLab Workstation, click on the
          "snapshot" option under the "precisionFDA" menu in the top menu bar.
        </p>
        <p>
          Once created and synched (via termination of the Workstation), a
          snapshot file will appear in your private Files area. You can
          recognize these files, as they will end in ".snapshot". This file may
          be an optional input to a new Workstation execution.
        </p>
        <p>
          <i>
            NOTE: In order to run the snapshot generation command, Python2.7
            must be included in the $PYTHONPATH variable. Installing Python
            managers, such as Conda/BioConda, may alter this path. If you see a
            failure to generate the snapshot, check to see if this path has been
            changed by running
            <code>echo $PYTHONPATH</code>.
          </i>
        </p>

        <h2 id="workstation-terminating">Terminating Workstations</h2>

        <p>
          <strong>TTYD</strong> Workstations will terminate after 30 days.
        </p>

        <p>
          <strong>Jupyter</strong> Workstations will terminate after 4 hours
          (240 minutes) by default. This timeout can be adjusted, either by
          providing a custom duration as an input or by using the "Adjust
          Duration" option in the Jupyter interface.
        </p>
        <p>
          You can terminate a Workstation at any time by selecting "Terminate"
          from the Execution detail page.
        </p>

        <p>
          Any uploaded files on a Workstation, pushed to the cloud using `dx
          upload`, will <strong>not</strong> appear on precisionFDA in your
          private area until the execution is synced, or until it is terminated.
          This syncing will happen automatically upon execution termination, but
          can be triggered to happen earlier by clicking on "Sync now" on the
          Execution detail page.
        </p>
        <p>
          Note that after a Workstation is terminated, any files on the worker
          are no longer accessible! Make sure to upload your work, or take a
          snapshot of the worker, before terminating.
        </p>
      </DocBody>
      <RightSide>
        <PageMap>
          <li>
            <a href="#workstation-types" data-turbolinks="false">
              Workstation Types
            </a>
          </li>
          <li>
            <a href="#workstation-access" data-turbolinks="false">
              Access to Workstations
            </a>
          </li>
          <li>
            <a href="#workstation-launching" data-turbolinks="false">
              Launching a Workstation
            </a>
          </li>
          <li>
            <a href="#workstation-accessing" data-turbolinks="false">
              Accessing files and data on Workstations
            </a>
          </li>
          <li>
            <a href="#workstation-snapshots" data-turbolinks="false">
              Creating snapshots on Workstations
            </a>
          </li>
          <li>
            <a href="#workstation-terminating" data-turbolinks="false">
              Terminating Workstations
            </a>
          </li>
        </PageMap>
      </RightSide>
    </DocRow>
  )
}

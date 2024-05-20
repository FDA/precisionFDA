/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { Link } from 'react-router-dom'
import { useScrollToHash } from '../../../hooks/useScrollToHash'
import { OutdatedDocsApps } from '../common'
import cwlwdlcreateapp from '../images/cwl_wdl_create_app.png'
import importcwlio from '../images/import_cwl_io.png'
import importcwlmodal from '../images/import_cwl_modal.png'
import importcwlmodalerror from '../images/import_cwl_modal_error.png'
import importcwlmodalscript from '../images/import_cwl_modal_script.png'
import importcwlwdlmodalsuccess from '../images/import_cwl_wdl_modal_success.png'
import importwdlio from '../images/import_wdl_io.png'
import importwdlmodal from '../images/import_wdl_modal.png'
import importwdlmodalerror from '../images/import_wdl_modal_error.png'
import importwdlmodalscript from '../images/import_wdl_modal_script.png'
import scripttabs from '../images/script_tabs.png'
import wdldefaultvals from '../images/wdl_default_vals.png'
import wdldefaultvals2 from '../images/wdl_default_vals_2.png'
import wdlioedit from '../images/wdl_io_edit.png'
import wdljsoninputs from '../images/wdl_json_inputs.png'
import wdljsoninputs2 from '../images/wdl_json_inputs_2.png'
import {
  DocBody,
  DocCallout,
  DocRow,
  DocsTip,
  DocTable,
  PageMap,
  RightSide,
} from '../styles'

export const CreatingApps = () => {
  useScrollToHash()
  return (
    <DocRow>
      <DocBody>
        <OutdatedDocsApps />
        <h1>Creating Apps</h1>

        <p>
          To create a new app, click "Create App" in the Apps page. The
          following section walks you through important concepts of app
          development.
        </p>
        <DocsTip>
          <span className="fa fa-lightbulb-o" aria-hidden="true" />{' '}
          <strong>TIP:</strong> Want to learn by example? Simply choose any of
          the public apps in precisionFDA and click "Fork". This will load up
          the app editor, where you can take a look at the internals of the app
          and see what it is comprised of. You can then hit the Back button in
          your web browser -- unless of course you truly want to fork the app
          and make a private copy with which you can experiment, in which case
          click the new Fork button from inside the app editor to complete the
          operation.
        </DocsTip>

        <h2 id="app-name">App naming conventions</h2>

        <p>
          Apps have a machine-readable name that cannot contain spaces (such as
          "bwa-freebayes") and a human-readable title (such as "BWA-MEM and
          FreeBayes"). Among apps that you create, names need to be unique (you
          cannot author two distinct apps with the same name). This restriction
          is only per-user, meaning that you can still create an app with the
          same name as someone else's app. In fact, the system encourages you to
          use someone else's app as a starting point and make further tweaks and
          save it as your own app (a process called "<strong>forking</strong>"
          an app). This model was inspired from the model of GitHub
          repositories.
        </p>

        <h2 id="app-io">Input and Output spec</h2>

        <p>
          Apps require an input/output specification, which mandates what inputs
          they need from the user, and what outputs they are expected to
          generate. Note that an "input" is anything that needs to be received
          from the user and which can potentially vary between executions. These
          can be not only input files but also numerical or boolean values, and
          strings. In that sense, the "inputs" can be used both for receiving
          data to operate on as well as receiving configuration parameters. Each
          input field has the following properties:
        </p>
        <DocTable>
          <thead>
            <tr>
              <th>Property</th>
              <th>Explanation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Class</td>
              <td>
                The kind of input. There are exactly five classes supported:
                file, string, integer, float and boolean.
              </td>
            </tr>
            <tr>
              <td>Array?</td>
              <td>
                Whether this input is an array. If so, the user can provide
                multiple values for this input.
              </td>
            </tr>
            <tr>
              <td>Name</td>
              <td>
                A machine-readable name for this input (no spaces allowed). The
                system will create a shell variable named after this, for your
                script to use.
              </td>
            </tr>
            <tr>
              <td>Label</td>
              <td>
                A human-readable label for this input. The system uses this to
                render the form that users see when launching the app.
              </td>
            </tr>
            <tr>
              <td>Help text</td>
              <td>
                Additional help text describing what this input field is about.
                The system shows this help text in the app details page ("spec"
                tab), and upon hovering on an input during app launch.
              </td>
            </tr>
            <tr>
              <td>Default value</td>
              <td>
                A default value that this field will be pre-filled with when
                users launch the app. (You are not required to provide defaults;
                do so only if you need to guide users in choosing the right
                values.)
              </td>
            </tr>
            <tr>
              <td>Choices</td>
              <td>
                A set of comma-separated values denoting the only permitted
                values for this field. If such choices are provided, the user
                must choose one of them using a drop-down menu and can't write
                in their own value.
              </td>
            </tr>
            <tr>
              <td>Optional?</td>
              <td>
                Whether this field is optional or required. When launching an
                app, users must fill all required fields before they can
                continue.
              </td>
            </tr>
          </tbody>
        </DocTable>
        <DocCallout>
          <h4>Input spec example</h4>
          <p>
            Let's consider an app which takes a BED file with genomic intervals,
            and extends each interval's coordinates by adding a fixed amount of
            padding on both sides. Here's an example of input spec:
          </p>
          <DocTable>
            <thead>
              <tr>
                <th>Property</th>
                <th>Value for 1st input</th>
                <th>Value for 2nd input</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Class</td>
                <td>file</td>
                <td>integer</td>
              </tr>
              <tr>
                <td>Array?</td>
                <td>false</td>
                <td>false</td>
              </tr>
              <tr>
                <td>Name</td>
                <td>intervals</td>
                <td>padding</td>
              </tr>
              <tr>
                <td>Label</td>
                <td>BED file with intervals</td>
                <td>Padding amount to add</td>
              </tr>
              <tr>
                <td>Help text</td>
                <td>The BED file whose genomic intervals will be extended.</td>
                <td>
                  The number of base pairs to extend each interval along both
                  directions.
                </td>
              </tr>
              <tr>
                <td>Default value</td>
                <td />
                <td>10</td>
              </tr>
              <tr>
                <td>Choices</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
              <tr>
                <td>Optional?</td>
                <td>false</td>
                <td>false</td>
              </tr>
            </tbody>
          </DocTable>
        </DocCallout>

        <p>
          The output specification is similar to the input specification (but
          with no default values). When creating an app, you specify what kind
          of inputs your app is expected to create, and define names and labels
          for them. When your script runs, it is responsible for generating the
          respective outputs. If an output is marked as optional, your script is
          not required to produce it. See the{' '}
          <a href="#app-script">app shell script</a> section for more
          information.
        </p>
        <DocCallout>
          <h4>Output spec example</h4>
          <p>
            To continue our aforementioned example, here is a potential output
            specification for our example app:
          </p>
          <DocTable>
            <thead>
              <tr>
                <th>Property</th>
                <th>Value for 1st output</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Class</td>
                <td>file</td>
              </tr>
              <tr>
                <td>Array?</td>
                <td>false</td>
              </tr>
              <tr>
                <td>Name</td>
                <td>padded_intervals</td>
              </tr>
              <tr>
                <td>Label</td>
                <td>Padded BED result</td>
              </tr>
              <tr>
                <td>Help text</td>
                <td>
                  The generated BED file with the padded genomic intervals.
                </td>
              </tr>
              <tr>
                <td>Optional?</td>
                <td>false</td>
              </tr>
            </tbody>
          </DocTable>
        </DocCallout>

        <h2 id="app-vm-env">VM Environment</h2>

        <p>
          Apps run inside a virtual machine (VM); a computer on the cloud with a
          specific environment. When authoring an app, you have the opportunity
          to configure the environment according to your needs, using the "VM
          Environment" tab.
        </p>
        <p>
          By default, apps do not have access to the Internet. Removing Internet
          access ensures that apps cannot communicate with the outside world
          over the Internet -- this increases user comfort and lowers the
          barriers for users to try out apps. If your app requires Internet
          access (for example, to communicate with a third-party database over
          the Internet, to fetch files from URLs, or to fetch and install
          external software at runtime), you can enable it in this tab.
        </p>
        <p>
          The default instance type denotes the particular hardware
          configuration that the app will run on. Each instance type comes with
          a specific amount of memory, number of CPU cores, and hard disk
          storage. See the section on{' '}
          <a href="#app-instance-types">available instance types</a> below for
          more information. Although you can choose a default one in the "VM
          Environment" tab, users can still override the default choice when
          launching the app. This is useful if you have a single app that can
          work for both small inputs (such as an exome) and large inputs (such
          as a whole genome).
        </p>
        <DocsTip>
          <span className="fa fa-lightbulb-o" aria-hidden="true" />{' '}
          <strong>TIP:</strong> Make a smart choice of default instance type.
          Select an instance that would be suitable for typical inputs, and use
          the app's Readme to guide users as to how to adjust it when running
          your app with larger inputs. Jobs consume energy depending on the
          instance type used, so your pipeline may be wasteful if it does not
          use its default instance type efficiently.
        </DocsTip>
        <p>
          The operating system of the virtual machine depends on your selection
          (either Ubuntu 14.04 or Ubuntu 16.04), with several preinstalled
          packages:
        </p>
        <ul>
          <li>
            <a data-turbolinks="false" href="/assets/ubuntu-14-packages.txt">
              Ubuntu 14.04 preinstalled packages
            </a>
          </li>
          <li>
            <a data-turbolinks="false" href="/assets/ubuntu-16-packages.txt">
              Ubuntu 16.04 preinstalled packages
            </a>
          </li>
        </ul>
        <p>
          If your app requires additional Ubuntu packages, you can specify so in
          the "VM Environment" tab. For example, if your app needs Java, we
          recommend adding the "openjdk-7-jre-headless" package. If you are
          unsure as to what a certain package is called, you can use the{' '}
          <a href="http://packages.ubuntu.com">packages.ubuntu.com</a> website
          to locate packages (make sure to select the "trusty" distribution in
          the search form, as that is the codename for Ubuntu 14.04 or "xenial"
          for Ubuntu 16.04). Note that, specifically for Java 8, we support
          additional packages (such as "openjdk-8-jre-headless") which are not
          listed on the Ubuntu packages website.
        </p>
        <p>
          If you need to load additional files onto the virtual machine and have
          them available to your app's shell script, such as executables,
          libraries, reference genome files or pretty much any other static
          files required for your execution, you can use <b>App assets</b>.
          Assets are tarballs that are uncompressed in the root folder of the
          virtual machine right before running your app script. The{' '}
          <a href="#app-assets">App assets</a> section discusses in detail how
          to create, manage, and select assets for your app.
        </p>
        <p>
          The shell script of an app contains the shell code that will run
          inside the virtual machine. The script runs as root. During the script
          execution, the default working directory (home directory) is{' '}
          <code>/work</code>. For more information about the shell variables
          available to your script, and the handling of app inputs and outputs
          from your script, consult the <a href="#app-script">App script</a>{' '}
          section.
        </p>
        <p>To summarize, here is what happens when your app is launched:</p>

        <DocTable>
          <thead>
            <tr>
              <th>Step</th>
              <th>&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>
                A new virtual machine with selected Ubuntu release and
                preinstalled packages is initialized.
              </td>
            </tr>
            <tr>
              <td>2</td>
              <td>
                Additional Ubuntu packages are installed per your app's spec.
              </td>
            </tr>
            <tr>
              <td>3</td>
              <td>
                Your app's assets are fetched and uncompressed in the root
                folder.
              </td>
            </tr>
            <tr>
              <td>4</td>
              <td>
                The job's input files are downloaded in subfolders under the{' '}
                <code>/work/in/</code> folder.
              </td>
            </tr>
            <tr>
              <td>5</td>
              <td>
                Shell variables are populated according to your job's inputs.
              </td>
            </tr>
            <tr>
              <td>6</td>
              <td>Your app's shell script is executed.</td>
            </tr>
          </tbody>
        </DocTable>

        <h2 id="app-instance-types">Available instance types</h2>

        <p>
          The precisionFDA system supports the following hardware configurations
          (instance types) for apps to run on:
        </p>

        <DocTable>
          <thead>
            <tr>
              <th>Instance type</th>
              <th># of CPU cores</th>
              <th>Memory</th>
              <th>Hard Disk Storage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Baseline 2</td>
              <td>2</td>
              <td>4 GB</td>
              <td>32 GB</td>
            </tr>
            <tr>
              <td>Baseline 4</td>
              <td>4</td>
              <td>8 GB</td>
              <td>80 GB</td>
            </tr>
            <tr>
              <td>Baseline 8</td>
              <td>8</td>
              <td>16 GB</td>
              <td>160 GB</td>
            </tr>
            <tr>
              <td>Baseline 16</td>
              <td>16</td>
              <td>32 GB</td>
              <td>320 GB</td>
            </tr>
            <tr>
              <td>Baseline 36</td>
              <td>36</td>
              <td>72 GB</td>
              <td>640 GB</td>
            </tr>
            <tr>
              <td />
            </tr>
            <tr>
              <td>High Mem 2</td>
              <td>2</td>
              <td>16 GB</td>
              <td>32 GB</td>
            </tr>
            <tr>
              <td>High Mem 4</td>
              <td>4</td>
              <td>32 GB</td>
              <td>80 GB</td>
            </tr>
            <tr>
              <td>High Mem 8</td>
              <td>8</td>
              <td>64 GB</td>
              <td>160 GB</td>
            </tr>
            <tr>
              <td>High Mem 16</td>
              <td>16</td>
              <td>128 GB</td>
              <td>320 GB</td>
            </tr>
            <tr>
              <td>High Mem 32</td>
              <td>32</td>
              <td>256 GB</td>
              <td>640 GB</td>
            </tr>
            <tr>
              <td />
            </tr>
            <tr>
              <td>High Disk 2</td>
              <td>2</td>
              <td>3.8 GB</td>
              <td>160 GB</td>
            </tr>
            <tr>
              <td>High Disk 4</td>
              <td>4</td>
              <td>7.5 GB</td>
              <td>320 GB</td>
            </tr>
            <tr>
              <td>High Disk 8</td>
              <td>8</td>
              <td>15 GB</td>
              <td>640 GB</td>
            </tr>
            <tr>
              <td>High Disk 16</td>
              <td>16</td>
              <td>30 GB</td>
              <td>1280 GB</td>
            </tr>
            <tr>
              <td>High Disk 36</td>
              <td>36</td>
              <td>60 GB</td>
              <td>2880 GB</td>
            </tr>
            <tr>
              <td />
            </tr>
            <tr>
              <td>GPU 8</td>
              <td>8</td>
              <td>60 GB</td>
              <td>160 GB</td>
            </tr>
          </tbody>
        </DocTable>

        <h2 id="app-assets">App assets</h2>

        <p>
          App assets are the building blocks of apps. They are tarballs (file
          archives), which get uncompressed in the root folder of the virtual
          machine before the app script starts to run. They can contain
          executables (such as bioinformatics tools), static data (such as
          reference genomes and index files) or pretty much anything else that
          is required for an app to run.
        </p>
        <p>
          Just like regular files, app assets can be either private or publicly
          contributed to the precisionFDA community. Your app can choose among
          any accessible assets (whether private or public).
        </p>
        <DocsTip>
          <span className="fa fa-lightbulb-o" aria-hidden="true" />{' '}
          <strong>TIP:</strong> You can have a public app that uses a private
          asset. In that case, people will be able to run the app, but will not
          have access to the private executables. They will also be able to fork
          the app but their fork won't include the private assets. This may be
          an option of choice if you want to allow people to try out something
          without giving them access to the code. For more information consult
          the second table in the <Link to="/docs/publishing">Publishing</Link>{' '}
          section.
        </DocsTip>
        <p>
          To help get you started, the precisionFDA team has contributed a few
          popular app assets that you can include in your app's environment. The
          table below lists some examples of such public app assets:
        </p>

        <DocTable>
          <thead>
            <tr>
              <th>Asset</th>
              <th>Contents</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>samtools-1.2</td>
              <td>
                The <code>/usr/bin/samtools</code> executable.
              </td>
            </tr>
            <tr>
              <td>htslib-1.2.1</td>
              <td>
                The <code>/usr/bin/bgzip</code> and <code>/usr/bin/tabix</code>{' '}
                executables.
              </td>
            </tr>
            <tr>
              <td>grch37-fasta</td>
              <td>
                The GRCh37 reference genome FASTA file (
                <code>/work/grch37.fa</code>).
              </td>
            </tr>
            <tr>
              <td>bwa-0.7.12</td>
              <td>
                The <code>/usr/bin/bwa</code> executable.
              </td>
            </tr>
            <tr>
              <td>bwa-grch37</td>
              <td>The GRCh37 reference genome, indexed for BWA.</td>
            </tr>
          </tbody>
        </DocTable>
        <p>
          When editing an app, in the "VM Environment" tab, you will see a list
          of assets that have been selected for inclusion in the app's virtual
          machine. You can remove assets by hovering over them and clicking the
          "X" button on the right hand side. You can select additional assets by
          clicking the "Select assets" button, which will pop up the asset
          selector.
        </p>
        <p>
          The selector lists all available assets on the left hand side.
          Clicking on the name of an asset, or on the checkbox next to it, will
          select that asset for inclusion. Clicking on the whitespace
          surrounding the asset name, or on the right-pointing arrow next to the
          asset name will display information about the asset (but not toggle
          the selection). <u>Each asset comes with documentation</u>, which is
          meant to describe what is the asset and how it can be used. In
          addition, the system displays a list of all files that are found
          inside the tarball.
        </p>
        <p>
          We understand that asset names may not always be indicative of their
          contents; for example, many people would recognize <code>tabix</code>{' '}
          as the executable that indexes VCF files, but fewer people would
          recognize <code>htslib</code> as the asset containing that executable.
          For this reason, the precisionFDA system includes a feature that
          allows you to search filenames across all assets. In the asset
          selector, type a search keyword (such as <code>tabix</code>) in the
          upper left corner. The asset list will be filtered to show you assets
          which include that file (such as <code>htslib</code>), as well as
          assets whose name starts with that prefix.
        </p>
        <p>
          To upload your own assets, or to perform more detailed asset
          management (such as download an asset to take a look at it yourself,
          or delete an asset you've previously uploaded) click "Manage your
          assets", from either the asset selector or the "VM Environment" tab
          (or "Manage Assets" from the Apps listing page). You will be taken to
          a page listing all the precisionFDA assets (your private ones, and all
          public ones). Click on an asset's name to see asset details, and to
          perform actions such as download, delete, or edit its readme. Click
          "Create Assets" at the top to be presented with instructions on how to
          upload your own assets. The next section discusses the process in
          detail.
        </p>

        <h2 id="app-own-assets">Your own assets</h2>

        <p>
          To upload an asset, you must first prepare the files that will be
          included in the tarball archive. On your computer, start by creating a
          "fake root" folder and by assembling your files underneath it.
        </p>
        <p>
          Since the asset will be uncompressed in the root folder on the cloud,
          it is important for the tarball to contain the proper subfolders
          inside of it. If an asset tarball does not have any subfolders, then
          its files will be placed directly inside the root folder (i.e. in{' '}
          <code>/</code>), which is not typically desired.
        </p>
        <p>
          Therefore, create the <code>usr/bin</code> subfolder under the "fake
          root" and place there any binaries, and create the <code>work</code>{' '}
          subfolder for any working directory files. Since your app's script
          starts its execution inside <code>/work</code>, any files you place
          under that folder will be readily accessible. For example, if your
          asset includes a file <code>/work/GenomeAnalysisTK.jar</code>, you can
          use it inside your script without any other folder designation, i.e.
          like this: <code>java -jar GenomeAnalysisTK.jar</code>.
        </p>
        <p>
          If you need to compile binaries for Ubuntu, or otherwise experiment
          with a Linux environment similar to the one that apps run on, download
          and install the freely available{' '}
          <a href="https://www.virtualbox.org/wiki/Downloads">VirtualBox</a>{' '}
          virtualizer. Then, from the "Create Assets" page, download the
          precisionFDA virtual machine image and double-click it to open it in
          VirtualBox. Power on the machine and log in as the <code>ubuntu</code>{' '}
          user. This environment contains the same Ubuntu packages as the cloud
          environment where apps run.
        </p>
        <DocsTip>
          <span className="fa fa-lightbulb-o" aria-hidden="true" />{' '}
          <strong>TIP:</strong> From your host operating system (such as the OS
          X Terminal) you can SSH into the VM by typing{' '}
          <code>ssh -p 2222 ubuntu@localhost</code>. This will allow you to use
          your host operating system's copy/paste capabilities, or to transfer
          files in and out of the VM.
        </DocsTip>
        <p>
          The following table summarizes ways in which you can use the
          VirtualBox machine to prepare content for inclusion in your fake root:
        </p>
        <DocTable>
          <thead>
            <tr>
              <th>To include...</th>
              <th>Do this...</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Compilable executables</td>
              <td>
                <code>make</code>
                <br />
                <code>mkdir -p fake_root/usr/bin</code>
                <br />
                <code>
                  cp <em>program</em> fake_root/usr/bin
                </code>
              </td>
            </tr>
            <tr>
              <td>Complex compilable packages</td>
              <td>
                <code>
                  ./configure --prefix=/opt/<em>packagename</em>
                </code>
                <br />
                <code>sudo make install</code>
                <br />
                <code>mkdir -p fake_root/opt/</code>
                <br />
                <code>
                  cp -R /opt/<em>packagename</em> fake_root/opt/
                </code>
              </td>
            </tr>
            <tr>
              <td>Python packages</td>
              <td>
                <code>
                  pip install --user <em>packagename</em>
                </code>
                <br />
                <code>mkdir -p fake_root/work/</code>
                <br />
                <code>mv ~/.local fake_root/work/</code>
              </td>
            </tr>
            <tr>
              <td>R packages</td>
              <td>
                <code>R</code>
                <br />
                <code>&gt; install.packages(...)</code>
                <br />
                Answer Y to the question "create a personal library"
                <br />
                <code>mkdir -p fake_root/work/</code>
                <br />
                <code>mv ~/R fake_root/work/</code>
              </td>
            </tr>
          </tbody>
        </DocTable>
        <p>
          After assembling your fake_root, prepare a Readme file for your asset.
          This file needs to contain{' '}
          <a href="https://jonschlinkert.github.io/remarkable/demo/">
            Markdown syntax
          </a>
          . Below is an example of the Readme file included with the
          htslib-1.2.1 public asset: (note the extra two spaces after
          tabix-1.2.1.html -- this is how you introduce line breaks in markdown)
        </p>
        <pre>
          This asset provides the `bgzip` and `tabix` executables.
          <br />
          <br />
          Include this asset if your app needs to compress and index
          <br />
          a VCF file.
          <br />
          <br />
          ### Example usage
          <br />
          <br />
          The following produces `file.vcf.gz` and `file.vcf.tbi`:
          <br />
          <br />
          ```
          <br />
          bgzip file.vcf
          <br />
          tabix -p vcf file.vcf.gz
          <br />
          ```
          <br />
          <br />
          ### Links
          <br />
          <br />
          http://www.htslib.org/doc/tabix-1.2.1.html
          <br />
          https://github.com/samtools/htslib/releases/tag/1.2.1
        </pre>
        <p>
          Download the precisionFDA uploader by clicking the respective button
          for your operating system (os) and architecture (arch) in the "Create
          Assets" page. The downloaded archive contains a single binary,{' '}
          <code>{'pfda_{os}_{arch}'}</code>, which you can run to upload the
          asset.
        </p>
        <p>
          The tool requires an "authorization key" in order to authenticate the
          client against the precisionFDA system. You can get a key by clicking
          the respective link in the "Add Assets" page. Copy the key from that
          page and paste it in the command below where it says{' '}
          <strong>KEY</strong>. For your security, the key is valid for 24h.
        </p>
        <p>
          Run{' '}
          <code>
            ./pfda --cmd upload-asset --key KEY --name my-asset.tar.gz --root
            /path/to/fake_root --readme my-asset.txt
          </code>
          . This command will archive the contents of the fake root into the
          named tarball, and upload it to precisionFDA along with the contents
          of the readme file. The tarball name must end in either{' '}
          <code>.tar.gz</code> or <code>.tar</code> (in which latter case it
          will not be compressed).
        </p>
        <DocsTip>
          <span className="fa fa-lightbulb-o" aria-hidden="true" />{' '}
          <strong>TIP:</strong> The uploader saves your key in{' '}
          <code>$HOME/.pfda_config</code>, so after you have run it once, you
          don't need to specify the key in subsequent invocations.
        </DocsTip>

        <h2 id="app-script">App script</h2>
        <p>
          When creating an app, the "Script" tab provides you with an editor
          where you can write the shell script that will be executed. The script
          will run as root, inside the <code>/work</code> folder (which is also
          set as the home directory during execution). The script is{' '}
          <code>source</code>
          'ed from inside bash, so you don't need to include any{' '}
          <code>#!/bin/bash</code> headers as they will be ignored. Bash by
          default runs with the <code>set -e -x -o pipefail</code> options.
        </p>
        <p>App inputs are handled in the following way:</p>
        <ul>
          <li>
            For string, integer, float and boolean inputs, the system defines a
            shell variable with the same name. Its value is set to whatever
            value the user provided for that input (or empty, if that input is
            optional and no value was provided)
          </li>
          <li>
            For files, the system downloads each file input under{' '}
            <code>
              /work/in/<em>field</em>/<em>filename</em>
            </code>
            . For instance, in the <a href="#app-io">example we gave earlier</a>
            , if a user provides a file called <code>trusight.bed</code> for the
            input field <code>intervals</code>, the system will download the
            file into <code>/work/in/intervals/trusight.bed</code>. In addition,
            the following variables are defined:
            <DocTable>
              <thead>
                <tr>
                  <th>Variable</th>
                  <th>Content</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>
                      $<em>field</em>
                    </code>
                  </td>
                  <td>
                    The unique system id (i.e. file-Bk0kjkQ0ZP01x1KJqQyqJ7yq) of
                    whatever file was assigned for that field.
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>
                      $<em>field</em>_name
                    </code>
                  </td>
                  <td>The filename.</td>
                </tr>
                <tr>
                  <td>
                    <code>
                      $<em>field</em>_path
                    </code>
                  </td>
                  <td>
                    The full file path, i.e.{' '}
                    <code>
                      /work/in/<em>field</em>/<em>filename</em>
                    </code>
                    .
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>
                      $<em>field</em>_prefix
                    </code>
                  </td>
                  <td>
                    The filename without its suffix (and if its suffix is ".gz",
                    without its second suffix, i.e. without ".tar.gz",
                    ".vcf.gz", or ".fastq.gz").
                  </td>
                </tr>
              </tbody>
            </DocTable>
          </li>
          <li>
            Input and output arrays are accessed in an indexed way e.g.
            <code>$<em>field_name[0]</em></code>. Examples of array usage follow:
          </li>
        </ul>
        <DocTable>
          <thead>
          <tr>
            <th>Scenario</th>
            <th>Example script</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>
              string[] string_output
              integer[] int_output
              float[] float_output
            </td>
            <td>
              <code>emit <em>string_output</em> "hello" "world"</code>
              <br/>
              <code>emit <em>int_output</em> 11 22 33</code>
              <br/>
              <code>emit <em>float_output</em> 10.5 13.1 77.7</code>
            </td>
          </tr>
          <tr>
            <td>
              string[] string_input
              <br/>
              string[] string_output
            </td>
            <td>
              <code><em>string_input[0]</em>="$&#123;<em>string_input[0]</em>&#125;""added_to_first_element"</code>
              <br/>
              <code><em>string_input[1]</em>="$&#123;<em>string_input[1]</em>&#125;""added_to_second_element"</code>
              <br/>
              <code>emit <em>string_output</em> "$&#123;<em>string_input[@]</em>&#125;"</code>
            </td>
          </tr>
          <tr>
            <td>file[] file_output</td>
            <td>
              <code>echo "Test output file 1." &gt; file1.txt</code>
              <br/>
              <code>echo "Test output file 2." &gt; file2.txt</code>
              <br/>
              <code>emit <em>file_output</em> file1.txt file2.txt</code>
            </td>
          </tr>
          <tr>
            <td>
              file[] file_input
              <br/>
              file[] file_output
            </td>
            <td>
              <code>arr=("test1.txt" "test2.txt")</code>
              <br/>
              <code>echo `head ./in/file_input/0/test.txt` &gt; test1.txt</code>
              <br/>
              <code>echo "added content" &gt;&gt; test1.txt</code>
              <br/>
              <code>echo "content" &gt; test2.txt</code>
              <br/>
              <code>emit <em>file_output</em> &quot;&#36;&#123;arr&#91;@&#93;&#125;&quot;</code>
            </td>
          </tr>
          </tbody>
        </DocTable>
        <DocCallout>
          <h4>Example of system-defined variables</h4>
          <p>
            For our <a href="#app-io">example</a>, the system would define the
            following variables:
          </p>
          <DocTable>
            <thead>
              <tr>
                <th>Variable</th>
                <th>Content</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>$intervals</code>
                </td>
                <td>
                  <code>file-Bk0kjkQ0ZP01x1KJqQyqJ7yq</code>
                </td>
              </tr>
              <tr>
                <td>
                  <code>$intervals_name</code>
                </td>
                <td>
                  <code>trusight.bed</code>
                </td>
              </tr>
              <tr>
                <td>
                  <code>$intervals_path</code>
                </td>
                <td>
                  <code>/work/in/intervals/trusight.bed</code>
                </td>
              </tr>
              <tr>
                <td>
                  <code>$intervals_prefix</code>
                </td>
                <td>
                  <code>trusight</code>
                </td>
              </tr>
            </tbody>
          </DocTable>
          <p>
            The system defines the prefix variable because it can be often used
            to name results. In our example app, we can name the padded
            intervals <code>"$intervals_prefix".padded.bed</code>.
          </p>
        </DocCallout>
        <p>
          Your script needs to communicate back to the system its outputs. This
          is handled via a helper utility called <code>emit</code>. Use it as
          follows:
        </p>
        <ul>
          <li>
            For string, integer, float and boolean outputs, type{' '}
            <code>
              emit&nbsp;&nbsp;<em>field</em>&nbsp;&nbsp;<em>value</em>
            </code>
            . For example, if you've defined an output field called{' '}
            <code>qc_pass</code> of boolean type, use{' '}
            <code>emit qc_pass true</code> to set it to true.
          </li>
          <li>
            For file outputs, type{' '}
            <code>
              emit&nbsp;&nbsp;<em>field</em>&nbsp;&nbsp;<em>filename</em>
            </code>
            . This command will upload the particular file from the local hard
            disk of the virtual machine onto the cloud storage, and assign it to
            that field.
          </li>
        </ul>
        <DocCallout>
          <h4>Example of app script</h4>
          <p>
            To put it all together, here is what the script would look like for
            our example app:
          </p>
          <pre>
            bedtools slop -i "$intervals_path" -g grch37.chrsizes -b "$padding"
            &gt;"$intervals_prefix".padded.bed
            <br />
            emit padded_intervals "$intervals_prefix".padded.bed
          </pre>
        </DocCallout>

        <h2 id="app-bash">Bash tips</h2>

        <p>
          Bash is the shell interpreter that runs your app's shell script. It is
          the most popular shell interpreter in Linux distributions, and also
          used to power the OS X Terminal app. In most systems you can reach the
          bash manual by typing <code>man bash</code>.
        </p>
        <p>
          On precisionFDA, your app's script runs with the{' '}
          <code>set -e -x -o pipefail</code> options. These options have the
          following effects:
        </p>
        <DocTable>
          <thead>
            <tr>
              <th>Option</th>
              <th>Effect</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>-e</code>
              </td>
              <td>The script will halt as soon as any command fails.</td>
            </tr>
            <tr>
              <td>
                <code>-x</code>
              </td>
              <td>
                The script will echo every command as it is executed into the
                output logs.
              </td>
            </tr>
            <tr>
              <td>
                <code>‑o&nbsp;pipefail</code>
              </td>
              <td>
                The script will halt as soon as any command fails in a pipeline
                of commands, i.e. <code>cmd1 | cmd2 | cmd3</code>.
              </td>
            </tr>
          </tbody>
        </DocTable>
        <DocsTip>
          <span className="fa fa-lightbulb-o" aria-hidden="true" />{' '}
          <strong>TIP:</strong> We use <code>pipefail</code> to ensure that code
          such as <code>{'zcat file.vcf.gz | head >vcf-header.txt'}</code> would
          fail if the input file was corrupted and could not be uncompressed.
          Without pipefail, a failure in the first part (<code>zcat</code>) of
          the pipeline would not cause this command to fail, so your script
          would have continued running. However, this means that you must be
          careful to not include any commands which may return non-zero exit
          status in your script. For example,{' '}
          <code>grep chr1 some_file | wc -l &gt;chr1-counts.txt</code> would
          fail if there are no <code>chr1</code> entries in{' '}
          <code>some_file</code>, instead of outputting the number{' '}
          <code>0</code> to <code>chr1-counts.txt</code> (because when grep does
          not find something, it fails). If you are worried about this behavior,
          you can undo the option via <code>set +o pipefail</code>.
        </DocsTip>
        <p>
          When using bash variables that refer to a single unit (such as a
          filename, or a value that should not be further tokenized or otherwise
          interpreted on the command line), it is{' '}
          <strong>strongly recommended</strong> that you enclose such variables
          within double quotes, i.e. <code>"$file_path"</code> instead of{' '}
          <code>$file_path</code>. This will allow you to handle corner cases
          such as spaces included in the filename.
        </p>

        <h2 id="app-fork">Forking an app</h2>

        <p>
          When viewing any app, clicking the "Fork" button will bring up the app
          editor and initialize it with the specification of the original app.
          You can make any changes and then save them into a new private app
          owned by you. (Unlike GitHub, precisionFDA does not keep track of
          forks, and the operation is always private).
        </p>
        <p>
          In addition, this feature can be used to take a peek at the insides of
          an app &mdash; just fork it to bring up the editor, and the simply
          cancel the operation. This allows you to see the app's script, assets,
          etc.
        </p>

        <h2 id="app-import">App Import</h2>

        <p>
          On precisionFDA, there are two methods for building apps. You may
          create apps on precisionFDA using the UI, as is described in{' '}
          <Link
            to="/pdfs/Tutorial_-_Apps_and_Workflows_-_20221130.pdf"
            target={'_blank'}
            aria-label="Navigation to creating apps module"
          >
            Creating Apps
          </Link>
          . However, advanced users may choose to instead create their app by
          writing a CWL or WDL file that contains all the pertinent details for
          the app and uploading this to precisionFDA.
        </p>

        <h2 id="app-import-reasons">Why Use App Import?</h2>
        <div className="bs-docs-section">
          <p>
            This import method for creating precisionFDA apps offers several
            advantages over the step-by-step UI method:
          </p>
          <ul>
            <li>
              If you are familiar with CWL or WDL, you may specify all of the
              parameters for your app without needing to click through multiple
              UI screens.
            </li>
            <li>
              Importing an app via a CWL or WDL script is an easy way to make
              use of public Docker images in an application format on
              precisionFDA.
            </li>
            <li>
              A CWL or WDL app script may be easily shared with other
              collaborators, allowing them to build and customize their own
              versions of this app, either on or off precisionFDA.
            </li>
            <li>
              Because the CWL or WDL script contains all parameters used by the
              app, it can be shared with collaborators who do not have
              precisionFDA accounts to explain how an analysis was performed.
            </li>
          </ul>
        </div>
        <h2 id="cwl-script-structure">How to Structure a CWL Script</h2>

        <p>
          In order to successfully import as an app in precisionFDA, a CWL
          script must include several key features.
        </p>
        <p>
          First, the inputs and outputs specified in the CWL script must be one
          of the five data types used on precisionFDA -{' '}
          <strong>file, string, float, integer, or Boolean</strong>. Arrays are
          not supported as a data type on precisionFDA, and any CWL script that
          specifies an array as an input or output will not import successfully
          as an app.
        </p>
        <p>
          Second, our CWL script includes a baseCommand, which is the actual
          instruction that the app will execute. If this baseCommand is not
          present, the script will not import successfully as an app, because
          the app will not see a valid set of commands to run.
        </p>
        <p>
          Third, output component should be specified and can not be left blank.
        </p>
        <p>
          Finally, note the DockerRequirement under requirements. Using this
          method, we specify a public Docker image that will be automatically
          pulled and used to execute the commands of the app.
        </p>
        <p>Other useful notes for creating a CWL script for app import:</p>
        <ul>
          <li>
            The <strong>id</strong> field will become the app name.
          </li>
          <li>
            The <strong>label</strong> field will become the title of the app.
          </li>
          <li>
            Information in the <strong>doc</strong> field will be included in
            the Readme of the app. You may provide details about how your app
            functions and what dependencies are used in this area.
          </li>
        </ul>
        <p>Here is our example CWL script:</p>
        <pre>
          #!/usr/bin/env cwl-runner
          <br />
          <br />
          class: CommandLineTool
          <br />
          <br />
          id: "cgp-chksum"
          <br />
          <br />
          label: "CGP file checksum generator"
          <br />
          <br />
          cwlVersion: v1.0
          <br />
          <br />
          doc: |<br />
          ![build_status](https://quay.io/repository/wtsicgp/dockstore-cgp-chksum/status)
          <br />
          A Docker container for producing file md5sum and sha512sum. See the
          [dockstore-cgp-chksum](https://github.com/cancerit/dockstore-cgp-chksum)
          website for more information.
          <br />
          <br />
          requirements:
          <br />
          - class: DockerRequirement
          <br />
          dockerPull: "quay.io/wtsicgp/dockstore-cgp-chksum:0.1.0"
          <br />
          <br />
          inputs:
          <br />
          in_file:
          <br />
          type: File
          <br />
          doc: "file to have checksum generated from"
          <br />
          inputBinding:
          <br />
          position: 1<br />
          <br />
          post_address:
          <br />
          type: ["null", string]
          <br />
          doc: "Optional POST address to send JSON results"
          <br />
          inputBinding:
          <br />
          position: 2<br />
          <br />
          outputs:
          <br />
          chksum_json:
          <br />
          type: File
          <br />
          outputBinding:
          <br />
          glob: check_sums.json
          <br />
          <br />
          post_server_response:
          <br />
          type: ["null", File]
          <br />
          outputBinding:
          <br />
          glob: post_server_response.txt
          <br />
          <br />
          baseCommand: ["/opt/wtsi-cgp/bin/sums2json.sh"]
          <br />
        </pre>

        <h2 id="cwl-import">How to Import a CWL File</h2>

        <p>
          To import your CWL file and create a precisionFDA app, you begin by
          navigating to the Apps page, where you select{' '}
          <strong>Create App</strong>. On the Create App page, you can see a
          button labeled <strong>Import from .cwl file</strong>.
        </p>

        <img
          width="100%"
          src={cwlwdlcreateapp}
          alt="Create an App with import options for CWL,WDL files and fields for App name and title"
        />

        <p>
          When you click on this button, you'll be prompted to select a local
          file from your computer with a .cwl extension. There is also a textbox
          to type in the CWL script if you don't have the file ready.
        </p>

        <img
          width="100%"
          src={importcwlmodal}
          alt="Import CWL modal popup with fields for typing CWL and an option to select CWL file"
        />

        <p>
          Once you select the CWL app file, the details will be automatically
          loaded into that textbox. Before you click on "Import" to make the new
          app, you may review the contents of the script to confirm that the
          proper options are specified.
        </p>

        <img
          width="100%"
          src={importcwlmodalscript}
          alt="Example CWL script on Import CWL modal popup"
        />

        <p>
          If you see a red error bar at the top of the page, there may be one or
          more components missing from your CWL script, or there may be a
          non-authorized data type specified in the script. If your type in your
          CWL script, make your that your script has correct indentation. Make
          sure that all components are present in the CWL script; you may
          consult the example CWL script in this help.
        </p>

        <img
          width="100%"
          src={importcwlmodalerror}
          alt="CWL import script error notification for nonexistent base command"
        />

        <p>
          Click "Import" to finish importing the script. If the script imports
          successfully, you will see the ID of your new app.
        </p>

        <img
          width="100%"
          src={importcwlwdlmodalsuccess}
          alt="Modal popup notification for successful app creation and App URL"
        />

        <p>
          After you click Ok, you can see all the inputs and outputs specified
          in the CWL file are shown as inputs and outputs of your app.
        </p>

        <img
          width="100%"
          src={importcwlio}
          alt="CWL App inputs and outputs displayed under SPEC tab"
        />

        <p>Documentation information appears in the Readme section.</p>

        <img
          width="100%"
          src={scripttabs}
          alt="CWL App inputs and outputs displayed under SPEC tab"
        />

        <h2 id="wdl-script-structure">How to Structure a WDL Script</h2>

        <p>
          In order to successfully import as an app in precisionFDA, the WDL
          script must include several key features.
        </p>
        <p>
          First, the inputs and outputs specified in the WDL script must be one
          of the five data types used on precisionFDA - file, string, float,
          integer, or Boolean. Arrays are not supported as a data type on
          precisionFDA, and any WDL script that specifies an array as an input
          or output will not import successfully as an app.
        </p>
        <p>
          Second, command only uses {} and cannot run with {'<<< and >>>'}.
        </p>
        <p>
          Finally, the required docker is under runtime. Using this method, we
          specify a public Docker image that will be automatically pulled and
          used to execute the commands of the app.
        </p>
        <p>
          The task name will become the app name and title. Output component is
          not required.
        </p>
        <p>Here is our example WDL script:</p>

        <pre>
          task bwa_mem_tool {'{'}
          <br />
          &nbsp;&nbsp;Int threads
          <br />
          &nbsp;&nbsp;Int min_seed_length
          <br />
          &nbsp;&nbsp;Int min_std_max_min
          <br />
          &nbsp;&nbsp;File reference
          <br />
          &nbsp;&nbsp;File reads
          <br />
          <br />
          &nbsp;&nbsp;command {'{'}
          <br />
          &nbsp;&nbsp; &nbsp;&nbsp;bwa mem -t ${'{'}threads{'}'} \<br />
          &nbsp;&nbsp; &nbsp;&nbsp;-k ${'{'}min_seed_length{'}'} \<br />
          &nbsp;&nbsp; &nbsp;&nbsp;-I ${'{'}sep=',' min_std_max_min+{'}'} \
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;${'{'}reference{'}'} \<br />
          &nbsp;&nbsp;&nbsp;&nbsp;${'{'}sep=' ' reads+{'}'} &gt; output.sam
          <br />
          &nbsp;&nbsp;{'}'}
          <br />
          &nbsp;&nbsp;output {'{'}
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;File sam = "output.sam"
          <br />
          &nbsp;&nbsp;{'}'}
          <br />
          &nbsp;&nbsp;runtime {'{'}
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;docker: "broadinstitute/baseimg"
          <br />
          &nbsp;&nbsp;{'}'}
          <br />
          {'}'}
        </pre>

        <h2 id="wdl-import">How to Import a WDL File</h2>

        <p>
          To import your WDL file and create a precisionFDA app, you navigate to
          the Apps page, where you select "Create App". On the Create App page,
          you can see a button labeled "Import from .wdl file".
        </p>

        <img
          width="100%"
          src={cwlwdlcreateapp}
          alt="Create an App with import options for CWL,WDL files and fields for App name and title"
        />

        <p>
          When you click on this button, you'll be prompted to select a local
          file from your computer with a .wdl extension. There is also a textbox
          to type in the WDL script if you don't have the file ready.
        </p>

        <img
          width="100%"
          src={importwdlmodal}
          alt="Import WDL modal popup with fields for typing WDL and an option to select WDL file"
        />

        <p>
          Once you select the WDL app file, the content will be automatically
          loaded into the textbox. Before you click on "Import" to make the new
          app, you may review the contents of the script to confirm that the
          proper options are specified.
        </p>

        <img
          width="100%"
          src={importwdlmodalscript}
          alt="Example WDL script on Import WDL modal popup"
        />

        <p>
          If you see a red error bar at the top of the page, there may be one or
          more components missing from your WDL script, or there may be a
          non-authorized data type specified in the script. Make sure that all
          components are present in the WDL script; you may consult the example
          WDL script in this help.
        </p>

        {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
        <img
          width="100%"
          src={importwdlmodalerror}
          alt="WDL import script error notification for wrong docker image name format"
        />

        <p>
          Click "Import" to finish importing the script. If the script imports
          successfully, you will see the ID of your new app.
        </p>

        <div className="bs-docs-section bs-docs-media-section bs-docs-media-img">
          {/* <%= image_tag("docs/creating_apps/import_cwl_wdl_modal_success.png", alt: "Modal popup notification for successful app creation and App URL") %> */}
        </div>

        <img
          width="100%"
          src={importcwlwdlmodalsuccess}
          alt="Modal popup notification for successful app creation and App URL"
        />

        <p>
          After you click Ok, you can see all the inputs and outputs specified
          in the WDL file are shown as inputs and outputs of your app.
        </p>

        <div className="bs-docs-section bs-docs-media-section bs-docs-media-img">
          {/* <%= image_tag("docs/creating_apps/import_wdl_io.png", alt: "WDL App inputs and outputs displayed under SPEC tab") %> */}
        </div>

        <img
          width="100%"
          src={importwdlio}
          alt="Modal popup notification for successful app creation and App URL"
        />

        <p>Click on "Edit" for any further revision.</p>

        <h2 id="wdl-optional-inputs">How to Handle Optional Inputs</h2>

        <ul>
          <li>
            <div>Add default values</div>
            <p>
              This is an example of an app that has "Reverse read" and "Output
              prefix" as optional inputs.
            </p>
            <img
              width="100%"
              src={wdldefaultvals}
              alt="Requried and optional inputs under SPEC tab"
            />
            <p>
              After importing the WDL file, all optional inputs don't have any
              default value. Click on "Edit" and fo to tab "I/O Spec" to add
              default values for optional inputs.
            </p>
            <img
              width="100%"
              src={wdlioedit}
              alt="WDL I/O Spec tab with Class,Name,Label,Helptext,DefaultValue,Optional field labels"
            />
            <p>Default values are shown in spec after editing.</p>
            <img
              width="100%"
              src={wdldefaultvals2}
              alt="Requried and optional inputs under SPEC tab"
            />
          </li>
          <li>
            <div>Customize inputs.json</div>
            <p>
              This step is required for all optional inputs that doesn't have a
              default value. If all inputs are required, there is no need to do
              this extra step.
            </p>
            <p>
              Click on "Edit" to open the editing page of the app, scroll down
              to the script that creates the inputs.json file.
            </p>
            <img
              width="100%"
              src={wdljsoninputs}
              alt="Script in inputs.json file"
            />
            <p>
              Modify the script for the optional inputs as following, make sure
              to change the workflow name (run_app) and the app name (app) into
              your workflow name and your app name in this script.
            </p>
            <img
              width="100%"
              src={wdljsoninputs2}
              alt="Modifiled script for optional inputs in inputs.json file"
            />
            <p>
              Since the "Output prefix" has default value has "out", it is not
              necessary to have an extra if block for this input parameter.
            </p>
          </li>
        </ul>
        <p />
      </DocBody>
      <RightSide>
        <PageMap>
          <li>
            <a href="#app-name" data-turbolinks="false">
              App naming conventions
            </a>
          </li>
          <li>
            <a href="#app-io" data-turbolinks="false">
              Input and Output spec
            </a>
          </li>
          <li>
            <a href="#app-vm-env" data-turbolinks="false">
              VM Environment
            </a>
          </li>
          <li>
            <a href="#app-instance-types" data-turbolinks="false">
              Available instance types
            </a>
          </li>
          <li>
            <a href="#app-assets" data-turbolinks="false">
              App assets
            </a>
          </li>
          <li>
            <a href="#app-own-assets" data-turbolinks="false">
              Your own assets
            </a>
          </li>
          <li>
            <a href="#app-script" data-turbolinks="false">
              App script
            </a>
          </li>
          <li>
            <a href="#app-bash" data-turbolinks="false">
              Bash tips
            </a>
          </li>
          <li>
            <a href="#app-fork" data-turbolinks="false">
              Forking an app
            </a>
          </li>
          <li>
            <a href="#app-import" data-turbolinks="false">
              App Import
            </a>
          </li>
          <li>
            <a href="#app-import-reasons" data-turbolinks="false">
              Why Use App Import?
            </a>
          </li>
          <li>
            <a href="#cwl-script-structure" data-turbolinks="false">
              How to Structure a CWL Script
            </a>
          </li>
          <li>
            <a href="#cwl-import" data-turbolinks="false">
              How to Import a CWL File
            </a>
          </li>
          <li>
            <a href="#wdl-script-structure" data-turbolinks="false">
              How to Structure a WDL Script
            </a>
          </li>
          <li>
            <a href="#wdl-import" data-turbolinks="false">
              How to Import a WDL File
            </a>
          </li>
          <li>
            <a href="#wdl-optional-inputs" data-turbolinks="false">
              How to Handle Optional Inputs
            </a>
          </li>
        </PageMap>
      </RightSide>
    </DocRow>
  )
}

---
title: Apps
---

> [!warning]
> The content on this page may be outdated. Please refer to the new [tutorials](/tutorials/apps/apps).

The Apps section of precisionFDA encapsulates all the activities for managing, running and sharing software. The system uses cloud technology that allows you to run any Linux software. You can explore and run apps published by other precisionFDA members, or introduce your own.

## Overview & Terminology

**Apps** are, in essence, shell scripts that run inside a Linux virtual machine on the cloud, and which are designed to perform whatever specific task has been envisioned by the app author. Apps come with an **I/O specification**, a 'contract' that describes the kinds of inputs they receive and the kinds of outputs they are expected to generate. For example, an app that performs mapping and variation calling may specify that it requires as input one or two FASTQ files, and that it will generate as output a BAM and a VCF file.

To run an app, the user needs to assign the app inputs (i.e. in the aforementioned example of the hypothetical mapping and variation calling app, the user needs to specify which FASTQ file they want to use). This creates a **job**, which is scheduled for execution in the cloud. Once the job completes, its output files (if any) will appear in the Files section.

Jobs are executed inside virtual machines (VMs) with specific hardware configurations, known as **instance types**. Each instance type comes with a specific amount of memory, number of CPU cores, and hard disk storage. The app author chooses a default instance type when creating an app, but users who run the app can override the default choice.

The virtual machine runs Ubuntu Linux 14.04 or 16.04 depending on selection with certain preinstalled **Ubuntu packages**. The app author, however, can select additional Ubuntu packages to be included with an app.

Apps are assembled from building blocks called **app assets**, which can be provided by the app author, or chosen from a library of existing assets provided by the precisionFDA community. App assets are simply tarballs (file archives), which get automatically unpacked inside the virtual machine when an app runs. They can contain executables (such as bioinformatics tools), static data (such as reference genomes and index files) or pretty much anything else that is required for an app to run.

After creating an app, the app author can further revise it. However, each change creates a new **revision**; previous revisions are retained and cannot be overwritten. When the author is happy with a particular revision, they can publish it so that others can use it. Subsequent revisions remain private until published. Users always see the latest published revision (but have access to all published revisions).

## Listing apps

The Apps page shows a collection of all the apps that you have access to. The "Relevant apps" section displays apps that you've created yourself, as well as third-party apps that you've run. The left pane displays the name of each app, and the username of its author underneath. (If the author is part of an organization, the name of the organization is prepended to the author's username). The right pane shows general information about the app, such as its input/output specifications, the app's "Readme" information, or any notes that it's attached to. If you've previously run this app, the right pane will display a list of jobs instead. You can also list jobs across all apps by clicking "All My Jobs" on the left.

The "Explore" section lists all publicly contributed apps, in order of creation time. The "explorers" column counts the number of users who have run the app. The "Ran by you?" column is set to "Yes" if you've run the latest published revision of the app, or "Not this revision" if you've run an earlier revision. If you've never run the app, the column shows a button for you to try out the app.

## Running an app

Click "Run App" to be taken to the app launch page. The page gets rendered according to the app's input/output specification. For each app input, you will be asked to provide a value. File inputs will present you with a "Select file..." button which you can use to choose a file from all the files accessible to you. String, integer, and float inputs will present you with a textbox to type a value (unless the author has pre-defined a set of choices for you to select from, in which case you will be presented with a drop-down menu). Boolean inputs will present you with True/False buttons.

The app specification may designate which inputs are required and which are optional, and may provide default values for some of them. Required inputs are rendered in bold text (and those that need your attention are colored red), and the "Run App" button on the upper right will turn blue once all the required inputs have been provided.

Additional help for each input (if provided by the app author) can be shown by hovering over the input label.

It is a good idea to give a unique name to this execution, describing what it is about. You can do so by editing the "Job Name" textbox at the top. The box is pre-filled with the app's name as a starting point.

The app author has designated a specific hardware configuration (instance type) for the app to run on by default. If you need to change it (for example, if you are providing very large files, and the default instance type would cause the app to run out of hard disk space), then select a different instance type from the dropdown. See the [available instance types](/guides/creating-apps#available-instance-types) for more info.

Once you click the "Run App" button on the upper right, the system will generate a new job that encapsulates that particular execution.

## Batch running an app

Apps can be run in batch. This feature allows you to run the same app multiple times, with different inputs each time. Adding batches can be done by clicking the "Add batch" button on the app launch page.

The system will launch separate jobs for each of the varying input values.

## Exporting an app

This feature allows you to export an app into a portable format (Docker container), so that you can run it on your own computer.

Docker is a software application that enables Linux executables to run in an isolated fashion, in a virtual system environment known as a container. See [Why Docker?](https://www.docker.com/why-docker) to obtain a further understanding of it's utility.

Docker runs on all popular platforms (Windows, Mac, and Linux). Visit [Get Started](https://www.docker.com/get-started) to download and install Docker on your computer.

To export an app, click "Export" and select "Docker Container". The system will generate a file named "Dockerfile", and you will be prompted to download it. This file contains machine instructions on how to assemble a Linux system with all the ingredients required to run the app: Ubuntu 14.04 or Ubuntu 16.04 operating system, additional Ubuntu packages required by the app, and the app's assets (executables and other files).

To make Docker interpret these instructions and create a corresponding Linux image, place the Dockerfile into an empty folder in your computer, and run the following command inside that folder: `docker build --tag myapp .`

This command will build a Linux image called "myapp" (feel free to change the tag to whatever you like). You only need to run this command once.

To verify that the image is on your system, run `docker images`. If the build was successful, you will see the "myapp" image listed as one of your available local images.

**IMPORTANT**: If an app includes any assets, the Dockerfile includes download links to these assets that are only valid for 24h. Therefore, any apps that include assets will only build successfully within 24h of downloading the Dockerfile.

To launch the app using Docker on your computer, run the following command: `docker run myapp` - this will instantiate a new container and try to run the app without any other input parameters. Since most apps require one or more inputs, this will result in the system displaying help on how to specify app inputs. Follow the instructions to specify app inputs; for example, if the app needs a BAM file called "mappings", you will need to run: `docker run myapp --mappings /path/to/file.bam`. **IMPORTANT**: The file paths given to the "run" command refer to locations inside the container, not your hard drive. To make a directory of your hard drive appear in some location inside the container, you must tell Docker about it using the `-v /path/to/host/directory:/path/inside/container` option. For example, let's say `file.bam` is in your Desktop on your Mac, i.e. `/Users/smith/Desktop/file.bam`. To make your Desktop appear as `/data` inside the container, use `docker run -v /Users/smith/Desktop:/data`, and to specify the use of `file.bam` as "mappings", run `docker run -v /Users/smith/Desktop:/data myapp --mappings /data/file.bam` (note how we specified `/data/file.bam`, since that's where we mapped the Desktop folder inside the container).

Apps on precisionFDA have one or more outputs. On the cloud, those are shown in the job details page, once the job is done. In the case of the Docker container, the execution writes its outputs inside the container, in the hardcoded `/data/out` directory. We chose that convention so that if you use `-v` to map a folder of your hard drive to `/data` (as we did in the example above), you will get the outputs conveniently added inside that directory underneath an `out` subdirectory.

This feature is currently in production. Please keep in mind that due to the nature of Linux container technology, the environment inside the container is not identical to the cloud environment. Moreover, certain configuration aspects of the app such as "Internet Access" or "Instance Type" are not reflected in the exported container. As always, we welcome your feedback and ideas on how to evolve this feature.

### CWL export

The Common Workflow Language (CWL) is an open standard for describing scientific pipelines. The precisionFDA system, in support of open standards, can export tools and workflows into metadata compatible with CWL. You will then be able to run the resulting CWL descriptions with implementations of CWL. A common starting point will be the reference implementation. [https://github.com/common-workflow-language/cwltool](https://github.com/common-workflow-language/cwltool)

Individual apps can also be exported to be a single CWL Tool. A tarball will be generated, containing the Dockerfile for the tool, a cwl definition of the tool, and a brief README.md file with instructions on how to build and use the tool. For example, taking a look at the results of exporting url\_fetcher as a CWL tool will generate `url_fetcher.tar.gz`.

```sh
$ mkdir url\_fetcher  
$ tar -xvzf url\_fetcher.tar.gz -C url\_fetcher  
x README.md  
x url\_fetcher.wdl  
x Dockerfile  
$ cd url\_fetcher  
$ cat README.md  
#url\_fetcher  
  
To execute this app locally, please ensure you have Docker (get.docker.com), Cromwell (https://github.com/broadinstitute/cromwell) and WDLTool (https://github.com/broadinstitute/wdltool) and run:  
  
```  
docker build . -t url\_fetcher  
java -jar /path/to/wdltool.jar inputs url\_fetcher.wdl > inputs.json  
java -jar /path/to/cromwell.jar run url\_fetcher.wdl -i inputs.json  
```  
  
where inputs.json is a standard WDL input file definition (see https://software.broadinstitute.org/wdl/ for examples).
```

The first command will build the docker image from the Dockerfile. The second command runs the cwl tool defined in the tool definition (the .cwl file) using the inputs specified (in the .json file). The inputs can also be specified on the command line rather than in the json file.

Workflows can also be exported in a CWL format. A tarball will be generated containing multiple Dockerfiles, multiple cwl definitions, and a brief README.md with instructions. In this case, use make with the Makefile to build all of the tools.

### WDL export

The Workflow Definition Language (WDL) is a workflow language supported by the Broad Institute. Broad uses WDL for their internal work and has specifically designed it to be human readable and writable. To support this open standard, the precisionFDA system can generate WDL definitions, which can be run with systems which are compliant with WDL. More information about WDL can be found on the Broad Institute's website https://software.broadinstitute.org/wdl/

Individual apps can be exported as a WDL task. A tarball will be generated containing the Dockerfile for the tool, a WDL definition of the task, and a brief README.md file with instructions on how to use the tool. For example, taking a look at the results of exporting the url\_fetcher app as a WDL task will generate `url_fetcher.tar.gz`.

```sh
$ mkdir url\_fetcher  
$ tar -xvzf url\_fetcher.tar.gz -C url\_fetcher  
x README.md  
x url\_fetcher.wdl  
x Dockerfile  
$ cd url\_fetcher  
$ cat README.md  
#url\_fetcher  
```  
To execute this app locally, please ensure you have Docker (get.docker.com), Cromwell (https://github.com/broadinstitute/cromwell) and WDLTool (https://github.com/broadinstitute/wdltool) and run:  

```
docker build . -t url\_fetcher  
java -jar /path/to/wdltool.jar inputs url\_fetcher.wdl > inputs.json  
java -jar /path/to/cromwell.jar run url\_fetcher.wdl -i inputs.json  
```

where inputs.json is a standard WDL input file definition (see https://software.broadinstitute.org/wdl/ for examples).

The example here utilizes cromwell, an open source workflow runner developed by the Broad Institute. Cromwell will take care of building the app based on the definition, and then running it based on the inputs provided.

Workflows can also be exported as WDL workflows. A tarball will be generated with multiple Dockerfiles, multiple WDL tasks for each individual tool, and a WDL task for the overall workflow. A README.md is provided with brief instructions on use.

## Job details and logs

Clicking on a job will take you to the job details page. The bottom section of the page shows the inputs that were chosen when the job was launched. If the job has finished successfully, it also shows the generated outputs. If the job has failed, it shows information related to the error.

The top section shows the job's **state** next to its name. Jobs go through the following states:

| State | Meaning |
| --- | --- |
| idle | The job has just been submitted. (Unless there is a cloud exception, jobs stay in that state only for a few seconds). |
| runnable | The job has been scheduled for execution, and a new virtual machine is getting initialized in order to run the job. Depending on cloud conditions, jobs may remain in that state anywhere between 0 and 20 minutes. |
| running | The job is currently running. |
| waiting\_on\_output | The job has finished successfully and has produced files which are being finalized by the system. |
| done | The job has finished successfully and its file outputs are available in the Files section. |
| failed | The job has failed. (In this case, no outputs are produced). |
| terminated | The job was terminated by the user before it had a chance to finish. |

The top section of the job details page displays additional information, including the job's instance type, duration and **cost in dollars**. The cost is calculated from a formula that takes into account the instance type as well as the duration. Jobs that run longer or that use more powerful instance types will consume more energy. Therefore, this metric can be used to compare pipelines in terms of their algorithmic efficiency.

> [!info] Tip
> Try to be green! Always optimize your workload by selecting the appropriate instance type when creating apps or launching jobs. Although the FDA is sponsoring your cloud usage, it may impose penalties if you end up wasting too much energy.

After the job has started running, you can review its log by clicking the "View Log" button. The log shows each line of the app script as it is being executed, and any messages generated in the Linux "standard output" or "standard error" streams. In addition, every 10 minutes the log shows a status line with memory, CPU, hard drive, and network bandwidth utilization. If you are looking at the logs while the job is running, click the "Refresh" button (or simply refresh the web page) to fetch any log updates — the page does not update itself in real time.

If the job is running (or queued for execution), you can terminate it by clicking the "Terminate" button.

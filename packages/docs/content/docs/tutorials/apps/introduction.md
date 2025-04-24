---
title: Introduction
---

This hands-on tutorial presents design patterns for collaborative bioinformatics using precisionFDA Apps and Workflows. There is a considerable range of design patterns for deploying code, marshalling data, and producing results, within precisionFDA's file and transient worker-driven (i.e. batch, non-interactive) application framework. This course will present this framework, including:

- Apps, their input/out specifications for files and other data types, virtual environment specification, and scripting
- Assets (i.e. tar archives) that can be bundled with assets and overlaid onto the worker's root volume
- Incorporation of Docker images into apps from file inputs and from assets
- Workflow creation using the web interface and WDL

Through the development of the tutorial artifacts, precisionFDA's powerful capabilities for secure collaborative development of bioinformatics tools, and sharing of -omics and RWD, are clearly demonstrated, and users will be empowered to develop their own bioinformatics use cases.

## Learning Objectives

Through this hands-on tutorial you will:

- Install the precisionFDA command line utility and use it upload and download files.
- Explore the multiple types of app inputs and outputs, assets, and their presentation to the app script as shell variables and files.
- Build a bioinformatics app from a biocontainers Docker image.
- Run the latest Ubuntu OS as a Docker image in an app.
- Use the precisionFDA Command Line Interface asset to process an arbitrary number of inputs or produce an arbitrary number of outputs to make up for the lack of an array data type.
- Create a workflow through the web interface.
- Create a workflow through by importing WDL.
- Access a database cluster from an app.
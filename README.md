# PrecisionFDA

PrecisionFDA is a community platform for NGS assay evaluation and
regulatory science exploration, accessible at https://precision.fda.gov/

## Webapp

The code in this repository represents the precisionFDA webapp, which
uses the Ruby on Rails framework. For more information on that framework,
visit:

http://guides.rubyonrails.org/

Installation of ruby dependencies is handled via bundler, and asset
management is done via bower.

Operation of the webapp relies on an upstream cloud backend, for
services such as user authentication, file storage and VM execution.
The site deployed at https://precision.fda.gov/ uses DNAnexus as the cloud
provider.

## PrecisionFDA command-line uploader

In addition to the webapp, this repo hosts the precisionFDA
command-line uploader. It can be found under the `tools` folder.

## Apps and other content

The deployed precisionFDA site includes content such as app assets, apps,
reference data, etc. Such content is added on top of the website and is not
part of this repository. You can access such public contributions on
https://precision.fda.gov/ where you can download files and app assets,
as well as fork apps to access their scripts.

## Comparison framework

The current comparison app runs `vcfeval` from Real Time Genomics.
You can access it at the following GitHub repo:

https://github.com/RealTimeGenomics/rtg-tools

## Development setup

To set up development environment please refer to [Development Setup](docs/DEVELOPMENT_SETUP.md).

## Using udocker

To use udocker please refer to [udocker user manual](https://github.com/indigo-dc/udocker/blob/master/doc/user_manual.md).

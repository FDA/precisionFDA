# React-based frontend development

This guide will cover all required steps to start working on
React-based frontend part.

## Setting up NodeJS
If you already have NodeJS installed in your system, you may use
it, but be careful since it's version can be outdated.

### Installing NodeJS via NVM
NodeJS can be installed by several ways, but the most preferred
is via [NVM](https://github.com/nvm-sh/nvm). Follow NVM's
guide to get it installed.

Run this command to install NodeJS:

``nvm install v12``

In order to use installed version run:

``nvm use``

If you want NVM to change node version automatically, please refer
to [this part of NVM manual](https://github.com/nvm-sh/nvm#automatically-call-nvm-use)

## Installing yarn

Run this command to install yarn globally:

`` npm i -g yarn ``

## Almost there...

Now change directory to ``client`` of project's root.

#### ALL THE FOLLOWING COMMANDS TILL THE END OF THIS MANUAL ARE SUPPOSED TO BE RUN FROM ``client`` DIRECTORY
 
Install required packages:

``yarn``

After all packages are installed, everything is ready to
start development.

### Defined yarn commands

Build production bundle:

``yarn run build:production``

Build development bundle:

``yarn run build``

Run instant rebuilding based on changes:

``yarn run watch``

Run webpack dev server:

`` yarn run server``

Run linter (ESLint):

`` yarn run lint <path_to_file_or_directory>``

Run tests:

``yarn run test <path_to_test_or_directory>``

## Note

Please run linter and tests before making a pull request, that
will economy other developers' time :)

##### For those who uses IDEs instead of text editors:
Most of IDEs have built-in support for ESLint, so please configure
them if not already.

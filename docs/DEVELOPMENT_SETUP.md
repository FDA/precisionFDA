# Development Setup
```
You can skip any section if you have already installed the dependencies.
```

## MacOS specific prerequisites
* Install XCode
    * Search and install Xcode from the App Store.
        
        Need different Xcode version? See [list of xip archive links](https://stackoverflow.com/a/10335943)

* Install Apple Command Line Tools
    * Open XCode (this just needs to run once to initialize it) and close it.
    * Install XCode command line tools by running `xcode-select --install` in
    the terminal.

* Install [Homebrew](http://brew.sh/)
    * `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
    * Run `brew update` to make sure all your formulas are current

* Install git
    * On Mavericks (10.9) or above you can do this simply by trying to run git from the Terminal the very first time:

        `git --version`

        If you don’t have it installed already, it will prompt you to install it.
    * Installing via Homebrew:

        `brew install git`

## Ubuntu/Linux specific prerequisites
* Update software packages definitions
    * `apt-get update`

* Install git
    * `apt-get install git`


## Common steps (MacOS and Ubuntu Linux)

* [Set up git ssh](https://docs.github.com/articles/generating-an-ssh-key/)
    * `ssh-keygen -t ed25519-sk -C "your_email@dnanexus.com"`

* Add generated SSH key to [Github](https://github.com/settings/keys)

* Set up git config
    * `git config --global core.editor "vim"`
    * `git config --global user.email “your_email@dnanexus.com”`
    * `git config --global user.name “FirstName LastName”`
    * `git config --global push.default simple`

* Clone repo
    * `git clone git@github.com:dnanexus/precision-fda.git`

* Create database config file
    * `cp config/database.sample.yml config/database.yml`

* Create environment config file
    * `cp .env.example .env`

* Ask Dev team for additional parameters to add into `.env` file


# Certificate and dev account

To develop on pFDA locally you need to manually add a new user and organization.
Because when you first get started in a new system,
there is no existing user. So you can't log in to provision new accounts.
This requires manually "bootstrapping" the situation in steps described below.

## Certificate and Key
- `brew install mkcert` - Install MKCert on your computer: https://github.com/FiloSottile/mkcert
- `mkcert -install`
- From project root run: `mkcert -key-file key.pem -cert-file cert.pem localhost 0.0.0.0 pfda.dev`
- This will create two files `key.pem` and `cert.pem`. They need to be generated on your machine to
  get rid of the annoying unprotected site warning in the browser.

## New account registration
Register for a new user account at [https://staging.dnanexus.com/register](https://staging.dnanexus.com/register).
Note: the first time you visit this, you will be prompted to enter the credentials 
(ask around for what it is).
You must choose an unused email address, but you can use the google "+" trick
to signup with a variable email address, e.g. `your_username+pfdalocal@dnanexus.com`.
Activate your account with the link sent to your email.

## Create a new organization:
- Download & install the DX Toolkit [https://documentation.dnanexus.com/downloads#dnanexus-platform-sdk](https://documentation.dnanexus.com/downloads#dnanexus-platform-sdk).
- Choose an unused handle, e.g. `{{yourname}}org`. Prepend `pfda..` (two dots),
 so that the final handle will be e.g. `pfda..farnsworthorg`.
- Type `dx login --staging` and log in with your new account.
- Type `dx new org --handle pfda..{{yourname}}org "{{Yourname}}'s org"`
- Log into the web UI [https://staging.dnanexus.com](https://staging.dnanexus.com)
with your account, access your profile on the upper right.
- Click __Billing Accounts__
- Click __Add Billing Info__ in the pfda..floranteorg entry.
  - Note: You may need to contact Laura (sales) for the billing info.
- Enter info (it doesn't have to be real, you can type "." in most entries). Enter your real DNAnexus email, however.
- Click __Update Billing Information__
- Check your email for a new email message asking you to confirm by clicking the link
- Click the link to confirm.


# Continue setup either using Docker or OS

[Docker-based setup (preferred)](DOCKER_BASED_SETUP.md) will require to install docker into your system. Dependencies MySQL and required gems will be installed into docker containers to minimize conflicts in the host system with other projects.

[OS-based setup](OS_BASED_SETUP.md) will require to install some additional software 
like MySQL, RVM and required gems directly into your OS.

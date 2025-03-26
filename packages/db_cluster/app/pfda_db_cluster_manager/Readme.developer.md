# pfda_db_cluster_manager Developer Readme

<!--
TODO: Please edit this Readme.developer.md file to include information
for developers or advanced users, for example:

* Information about app internals and implementation details
* How to report bugs or contribute to development
-->

## Build the app
To build the app, use following commands from the Makefile: 
* `make applet` - to build applet on platform
* `make app-staging` - to build and publish app on DNAnexus staging platform
* `make app-production` - to build and publish on DNAnexus production platform

`make get-encryption-key` - this command inserts the `encryption_key` into the app during build to decrypt app input. 

NOTES: 
* Make sure you have the correct `STAGE` variable set and you are logged in to the correct environment AWS account.
* `/pfda/${STAGE}/dbcluster_app/encryption_key` - This parameter must be created in the parameter store and have a value.
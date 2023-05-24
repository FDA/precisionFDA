name "pfda"

maintainer "DNAnexus"
maintainer_email "amoroz-cf@dnanexus.com"
license "All Rights Reserved"
description "Installs/Configures pfda"
long_description "Installs and configures pFDA server"
version "0.1.0"
chef_version ">= 17.10", "< 18.3"

depends "aws", "~> 9.0"
depends "nodejs", "~> 10.1"
depends "tomcat", "~> 5.0"

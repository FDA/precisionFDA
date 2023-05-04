name "pfda"

maintainer "DNAnexus"
maintainer_email "amoroz-cf@dnanexus.com"
license "All Rights Reserved"
description "Installs/Configures pfda"
long_description "Installs and configures pFDA server"
version "0.1.0"
chef_version "~> 17.10.3" if respond_to?(:chef_version)

depends "aws", "~> 8.4.0"
depends "nodejs", "~> 7.3.2"
depends "tomcat", "~> 5.0.9"

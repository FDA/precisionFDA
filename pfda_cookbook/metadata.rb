name 'pfda'
maintainer 'The Authors'
maintainer_email 'you@example.com'
license 'All Rights Reserved'
description 'Installs/Configures pfda'
long_description 'Installs/Configures pfda'
version '0.1.0'
chef_version '>= 12.14' if respond_to?(:chef_version)

depends 'application', '~> 5.2.0'
depends 'application_git', '~> 1.2.0'
depends 'application_ruby', '~> 4.1.0'

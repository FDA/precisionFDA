#
# Some globally available constants. Could also become env-specific
# by using: if Rails.env.development? { .... }
#

DNANEXUS_AUTHSERVER_URI = "https://stagingauth.dnanexus.com/"
DNANEXUS_APISERVER_URI = "https://stagingapi.dnanexus.com/"
OAUTH2_REDIRECT_URI = "https://localhost:3000/return_from_login"

# DNAnexusAPI
require 'dnanexus_api'
# DNAnexusAuth
require 'dnanexus_auth'


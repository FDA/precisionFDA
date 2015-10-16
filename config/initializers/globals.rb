#
# Some globally available constants. Could also become env-specific
# by using: if Rails.env.development? { .... }
#

DNANEXUS_AUTHSERVER_URI = "https://stagingauth.dnanexus.com/"
DNANEXUS_APISERVER_URI = "https://stagingapi.dnanexus.com/"

if Rails.env.development?
  OAUTH2_REDIRECT_URI = "https://localhost:3000/return_from_login"
  OAUTH2_CLIENT_ID = "precision_fda"
else
  OAUTH2_REDIRECT_URI = "https://precision.fda.gov/return_from_login"
  OAUTH2_CLIENT_ID = "precision_fda_gov"
end

# DNAnexusAPI
require 'dnanexus_api'
# DNAnexusAuth
require 'dnanexus_auth'


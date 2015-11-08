#
# Some globally available constants. Could also become env-specific
# by using: if Rails.env.development? { .... }
#

if Rails.env.development?
  OAUTH2_REDIRECT_URI = "https://localhost:3000/return_from_login"
  OAUTH2_CLIENT_ID = "precision_fda"
else
  OAUTH2_REDIRECT_URI = "https://precision.fda.gov/return_from_login"
  OAUTH2_CLIENT_ID = "precision_fda_gov"
end

# The following depend on whether we are talking
# to staging or not
DNANEXUS_AUTHSERVER_URI = "https://stagingauth.dnanexus.com/"
DNANEXUS_APISERVER_URI = "https://stagingapi.dnanexus.com/"
APPKIT_TGZ = "project-BgxXF600109B227BjbgZPY87:/appkit.tgz"
ORG_EVERYONE = "org-precisionfda"

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

if ENV["DNANEXUS_BACKEND"] == "production"
  DNANEXUS_AUTHSERVER_URI = "https://auth.dnanexus.com/"
  DNANEXUS_APISERVER_URI = "https://api.dnanexus.com/"
  # The following need to be changed on Monday Nov 9
  APPKIT_TGZ = "project-BgxXF600109B227BjbgZPY87:/appkit.tgz"
  ORG_EVERYONE = "org-precisionfda"
  ADMIN_TOKEN = ENV["ADMIN_TOKEN"]
else
  DNANEXUS_AUTHSERVER_URI = "https://stagingauth.dnanexus.com/"
  DNANEXUS_APISERVER_URI = "https://stagingapi.dnanexus.com/"
  APPKIT_TGZ = "project-BgxXF600109B227BjbgZPY87:/appkit.tgz"
  # The following need to be changed on Monday Nov 9
  ORG_EVERYONE = "org-precisionfda"
  ADMIN_TOKEN = "BEI5ErikmLb8kmQUPiHz7JB78reoftSL"
end

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
  DNANEXUS_PLATFORM_URI = "https://platform.dnanexus.com/"
  APPKIT_TGZ = "project-Bk0j9YQ09Zjky196xkJ4Bzgy:/appkit.tgz"
  ORG_EVERYONE = "org-precisionfda"
  ORG_DUMMY = "org-precisionfda.dummy"
  ADMIN_TOKEN = ENV["ADMIN_TOKEN"]
  DEFAULT_COMPARISON_APP = "app-pfda-comparator/0.2.4"
  CONSISTENCY_DISCUSSION_ID = 1
  # Hard-code uid for NA12878-NISTv2.19 for feedback link
  NIST_VCF_UID = "file-Bk50V4Q0qVb65P0v2VPbfYPZ"
else
  DNANEXUS_AUTHSERVER_URI = "https://stagingauth.dnanexus.com/"
  DNANEXUS_APISERVER_URI = "https://stagingapi.dnanexus.com/"
  DNANEXUS_PLATFORM_URI = "https://staging.dnanexus.com/"
  APPKIT_TGZ = "project-Bk0YZkj0YkbBg6bk38PzQkVV:/appkit.tgz"
  ORG_EVERYONE = "org-precisionfda"
  ORG_DUMMY = "org-precisionfda.dummy"
  ADMIN_TOKEN = ENV["ADMIN_TOKEN"]
  DEFAULT_COMPARISON_APP = "app-pfda-comparator/0.2.4"
  CONSISTENCY_DISCUSSION_ID = 1
  # Hard-code uid for NA12878-NISTv2.19 for feedback link
  NIST_VCF_UID = "file-Bk0kjkQ0ZP01x1KJqQyqJ7yB"
end
BILLING_CONFIRMATION = ENV["BILLING_CONFIRMATION"]

# Challenges
CONSISTENCY_CHALLENGE_END_DATE = DateTime.new(2016,4,25).in_time_zone.end_of_day
CONSISTENCY_CHALLENGE_ACTIVE = DateTime.now.in_time_zone < CONSISTENCY_CHALLENGE_END_DATE

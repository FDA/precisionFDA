#
# Some globally available constants. Could also become env-specific
# by using: if Rails.env.development? { .... }
#

if Rails.env.development?
  OAUTH2_REDIRECT_URI = "https://localhost:3000/return_from_login"
  OAUTH2_CLIENT_ID = "precision_fda"
elsif ENV["DNANEXUS_BACKEND"] == "production"
  OAUTH2_REDIRECT_URI = "https://precision.fda.gov/return_from_login"
  OAUTH2_CLIENT_ID = "precision_fda_gov"
else
  OAUTH2_REDIRECT_URI = "https://precisionfda-staging.dnanexus.com/return_from_login"
  OAUTH2_CLIENT_ID = "precision_fda_gov"
end

# The following depend on whether we are talking
# to staging or not

if ENV["DNANEXUS_BACKEND"] == "production"
  DNANEXUS_AUTHSERVER_URI = "https://auth.dnanexus.com/"
  DNANEXUS_APISERVER_URI = "https://api.dnanexus.com/"
  DNANEXUS_PLATFORM_URI = "https://platform.dnanexus.com/"
  CONSISTENCY_DISCUSSION_ID = 1
  TRUTH_DISCUSSION_ID = 6
  # Hard-code uid for NA12878-NISTv2.19 for feedback link
  NIST_VCF_UID = "file-Bk50V4Q0qVb65P0v2VPbfYPZ"
  COMPARATOR_V1_APP_ID = "app-BqB9XZ8006ZZ2g5KzGXP3fpq"
else
  DNANEXUS_AUTHSERVER_URI = "https://stagingauth.dnanexus.com/"
  DNANEXUS_APISERVER_URI = "https://stagingapi.dnanexus.com/"
  DNANEXUS_PLATFORM_URI = "https://staging.dnanexus.com/"
  CONSISTENCY_DISCUSSION_ID = 1
  TRUTH_DISCUSSION_ID = 4 # TODO: Update this to the discussion id of challenge
  # Hard-code uid for NA12878-NISTv2.19 for feedback link
  NIST_VCF_UID = "file-Bk0kjkQ0ZP01x1KJqQyqJ7yB"
  COMPARATOR_V1_APP_ID = "app-F1qFJ7j0F5GjY9P362yQF2vX"
end

APPKIT_TGZ = ENV["APPKIT_TGZ"]
ORG_EVERYONE = ENV["ORG_EVERYONE"]
ORG_DUMMY = ENV["ORG_DUMMY"]
ADMIN_TOKEN = ENV["ADMIN_TOKEN"]
DEFAULT_COMPARISON_APP = ENV["DEFAULT_COMPARISON_APP"]
BILLING_CONFIRMATION = ENV["BILLING_CONFIRMATION"]
CHALLENGE_BOT_TOKEN = ENV["CHALLENGE_BOT_TOKEN"]
CHALLENGE_BOT_DX_USER = ENV["CHALLENGE_BOT_DX_USER"]

# Challenge 1 - Consistency
CONSISTENCY_CHALLENGE_START_DATE = DateTime.new(2016,2,25).in_time_zone.end_of_day + 4.hours
CONSISTENCY_CHALLENGE_END_DATE = DateTime.new(2016,4,25).in_time_zone.end_of_day + 4.hours
CONSISTENCY_CHALLENGE_RESULTS_DATE = DateTime.new(2016,5,25,16,50).in_time_zone + 8.hours

# Challenge 2 - Truth
TRUTH_CHALLENGE_START_DATE = DateTime.new(2016,4,26).in_time_zone.end_of_day + 4.hours
TRUTH_CHALLENGE_END_DATE = DateTime.new(2016,5,26).in_time_zone.end_of_day + 4.hours
TRUTH_CHALLENGE_RESULTS_DATE = DateTime.new(2016,6,29,6,30).in_time_zone + 7.hours

ALLOWED_CLASSES_FOR_LICENSE = ["file", "asset"]
ALLOWED_CLASSES_FOR_TAGGING = ["app-series", "answer", "asset", "comparison", "file", "discussion", "job", "note"]

# Challenge 3 - App-a-thon in a Box
APPATHON_IN_A_BOX_HANDLE = "app-a-thon-in-a-box"
APPATHON_IN_A_BOX_DISCUSSION_ID = 22
APPATHON_IN_A_BOX_RESULTS_DATE = DateTime.new(2017,1,4,14,10).in_time_zone + 8.hours

ACTIVE_META_APPATHON = APPATHON_IN_A_BOX_HANDLE
# Remove X-Runtime
Rails.application.config.middleware.delete(Rack::Runtime)

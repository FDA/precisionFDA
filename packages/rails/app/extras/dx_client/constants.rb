module DXClient
  # Provides different API constants.
  module Constants
    ORG_MEMBERSHIP_ADMIN = "ADMIN".freeze
    ORG_MEMBERSHIP_MEMBER = "MEMBER".freeze
    ORG_MEMBERSHIP_NONE = "NONE".freeze

    PROJECT_ACCESS_ADMINISTER = "ADMINISTER".freeze
    PROJECT_ACCESS_CONTRIBUTE = "CONTRIBUTE".freeze
    PROJECT_ACCESS_UPLOAD = "UPLOAD".freeze
    PROJECT_ACCESS_VIEW = "VIEW".freeze
    PROJECT_ACCESS_NONE = "NONE".freeze

    JOB_MAILING_POLICY_ALWAYS = "always".freeze
    JOB_MAILING_POLICY_FAILURES_ONLY = "failuresOnly".freeze
    JOB_MAILING_POLICY_NEVER = "never".freeze
  end
end

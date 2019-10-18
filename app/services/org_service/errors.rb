module OrgService
  module Errors
    class OrgServiceError < StandardError; end
    class AdminIsNotLastInOrgError < OrgServiceError; end
  end
end

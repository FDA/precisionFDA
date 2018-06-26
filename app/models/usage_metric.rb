class UsageMetric < ActiveRecord::Base
  include Auditor

  belongs_to :user

end

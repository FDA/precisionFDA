# == Schema Information
#
# Table name: accepted_licenses
#
#  id         :integer          not null, primary key
#  license_id :integer
#  user_id    :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  state      :string
#  message    :text
#

require 'test_helper'

class AcceptedLicenseTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end

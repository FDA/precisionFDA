# == Schema Information
#
# Table name: licenses
#
#  id                :integer          not null, primary key
#  content           :text
#  user_id           :integer
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  title             :string
#  scope             :string
#  approval_required :boolean          default(FALSE), not null
#

require 'test_helper'

class LicenseTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end

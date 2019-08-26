# == Schema Information
#
# Table name: space_memberships
#
#  id         :integer          not null, primary key
#  user_id    :integer
#  space_id   :integer
#  role       :string
#  side       :string
#  meta       :text
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

require 'test_helper'

class SpaceMembershipTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end

# == Schema Information
#
# Table name: licensed_items
#
#  id               :integer          not null, primary key
#  license_id       :integer
#  licenseable_id   :integer
#  licenseable_type :string
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#

require 'test_helper'

class LicensedItemTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end

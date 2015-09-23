# == Schema Information
#
# Table name: orgs
#
#  id         :integer          not null, primary key
#  handle     :string
#  name       :string
#  admin_id   :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

require 'test_helper'

class OrgTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end

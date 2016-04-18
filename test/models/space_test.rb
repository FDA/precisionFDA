# == Schema Information
#
# Table name: spaces
#
#  id            :integer          not null, primary key
#  name          :string
#  description   :text
#  host_project  :string
#  guest_project :string
#  host_dxorg    :string
#  guest_dxorg   :string
#  space_type    :string
#  state         :string
#  meta          :text
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#

require 'test_helper'

class SpaceTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end

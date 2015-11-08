# == Schema Information
#
# Table name: invitations
#
#  id         :integer          not null, primary key
#  first_name :string
#  last_name  :string
#  email      :string
#  org        :string
#  singular   :boolean
#  address    :string
#  phone      :string
#  duns       :string
#  ip         :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

require 'test_helper'

class InvitationTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end

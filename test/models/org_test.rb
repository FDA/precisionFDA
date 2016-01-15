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
#  address    :text
#  duns       :string
#  phone      :string
#  state      :string
#  singular   :boolean
#

require 'test_helper'

class OrgTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end

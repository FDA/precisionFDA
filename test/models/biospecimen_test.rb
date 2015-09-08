# == Schema Information
#
# Table name: biospecimen
#
#  id          :integer          not null, primary key
#  name        :string
#  description :text
#  user_id     :integer
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#

require 'test_helper'

class BiospecimenTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end

# == Schema Information
#
# Table name: comparisons
#
#  id          :integer          not null, primary key
#  name        :string
#  description :text
#  user_id     :integer
#  state       :string
#  dxjobid     :string
#  project     :string
#  meta        :text
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  scope       :string
#

require 'test_helper'

class ComparisonTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end

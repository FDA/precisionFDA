# == Schema Information
#
# Table name: analyses
#
#  id          :integer          not null, primary key
#  name        :string
#  dxid        :string
#  user_id     :integer
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  workflow_id :integer
#

require 'test_helper'

class AnalysisTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end

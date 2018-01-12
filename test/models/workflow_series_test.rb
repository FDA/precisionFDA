# == Schema Information
#
# Table name: workflow_series
#
#  id                          :integer          not null, primary key
#  dxid                        :string
#  name                        :string
#  latest_revision_workflow_id :integer
#  user_id                     :integer
#  scope                       :string
#  created_at                  :datetime         not null
#  updated_at                  :datetime         not null
#

require 'test_helper'

class WorkflowSeriesTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end

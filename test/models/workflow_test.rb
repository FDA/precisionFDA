# == Schema Information
#
# Table name: workflows
#
#  id                  :integer          not null, primary key
#  title               :string
#  name                :string
#  dxid                :string
#  user_id             :integer
#  readme              :text
#  edit_version        :string
#  spec                :text
#  default_instance    :string
#  scope               :string
#  revision            :integer
#  workflow_series_id :integer
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#

require 'test_helper'

class WorkflowTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end

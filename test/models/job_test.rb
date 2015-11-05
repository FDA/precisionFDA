# == Schema Information
#
# Table name: jobs
#
#  id            :integer          not null, primary key
#  dxid          :string
#  app_id        :integer
#  project       :string
#  run_data      :text
#  describe      :text
#  provenance    :text
#  state         :string
#  name          :string
#  user_id       :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  app_series_id :integer
#  scope         :string
#

require 'test_helper'

class JobTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end

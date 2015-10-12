# == Schema Information
#
# Table name: jobs
#
#  id         :integer          not null, primary key
#  dxid       :string
#  series     :string
#  app_id     :integer
#  project    :string
#  spec       :text
#  run_data   :text
#  describe   :text
#  provenance :text
#  app_meta   :text
#  state      :string
#  name       :string
#  user_id    :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

require 'test_helper'

class JobTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end

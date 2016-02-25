# == Schema Information
#
# Table name: discussions
#
#  id         :integer          not null, primary key
#  user_id    :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  note_id    :integer
#

require 'test_helper'

class DiscussionTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end

# == Schema Information
#
# Table name: answers
#
#  id            :integer          not null, primary key
#  user_id       :integer
#  discussion_id :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  note_id       :integer
#

require 'test_helper'

class AnswerTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end

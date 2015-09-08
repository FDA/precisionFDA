# == Schema Information
#
# Table name: user_files
#
#  id             :integer          not null, primary key
#  dxid           :string
#  project        :string
#  name           :string
#  state          :string
#  description    :text
#  user_id        :integer
#  biospecimen_id :integer
#  public         :boolean
#  file_size      :integer
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#

require 'test_helper'

class UserFileTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end

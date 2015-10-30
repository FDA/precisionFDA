# == Schema Information
#
# Table name: apps
#
#  id            :integer          not null, primary key
#  dxid          :string
#  version       :string
#  revision      :integer
#  title         :string
#  readme        :text
#  user_id       :integer
#  scope         :string
#  spec          :text
#  internal      :text
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  app_series_id :integer
#

require 'test_helper'

class AppTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end

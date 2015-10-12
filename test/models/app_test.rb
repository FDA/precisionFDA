# == Schema Information
#
# Table name: apps
#
#  id         :integer          not null, primary key
#  dxid       :string
#  series     :string
#  project    :string
#  version    :string
#  is_latest  :boolean
#  is_applet  :boolean
#  name       :string
#  title      :string
#  readme     :text
#  user_id    :integer
#  scope      :string
#  spec       :text
#  internal   :text
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

require 'test_helper'

class AppTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end

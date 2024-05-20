# == Schema Information
#
# Table name: notifications
#
#  id           :integer          not null, primary key
#  action       :string(255)      not null
#  message      :string(4096)
#  meta         :string(4096)
#  severity     :string(255)
#  delivered_at :datetime
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  user_id      :integer
#

# Class represents notification about some action
class Notification < ApplicationRecord
  belongs_to :user
end

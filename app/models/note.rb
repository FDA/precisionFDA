# == Schema Information
#
# Table name: notes
#
#  id         :integer          not null, primary key
#  title      :string
#  slug       :string
#  content    :text
#  user_id    :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  scope      :string
#

class Note < ActiveRecord::Base
  include Permissions

  belongs_to :user

  def to_param
    "#{id}-#{title.parameterize}"
  end
end

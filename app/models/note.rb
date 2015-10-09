# == Schema Information
#
# Table name: notes
#
#  id         :integer          not null, primary key
#  title      :string
#  slug       :string
#  content    :text
#  public     :boolean
#  user_id    :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Note < ActiveRecord::Base
  extend FriendlyId
  friendly_id :slug_candidates, use: :slugged
  belongs_to :user

  def self.accessible_by(user_id)
    raise unless user_id.present?
    return where.any_of(user_id: user_id, public: true)
  end

  def slug_candidates
    [
      :title
    ]
  end
end

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

class UserFile < ActiveRecord::Base
  belongs_to :user
  belongs_to :biospecimen
  has_many :comparison_inputs
  has_many :comparisons, -> { distinct }, {through: :comparison_inputs, dependent: :restrict_with_exception}

  def self.accessible_by(user_id)
    raise unless user_id.present?
    return where.any_of(user_id: user_id, public: true)
  end

end

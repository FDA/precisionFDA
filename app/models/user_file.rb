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
#  parent_id      :integer
#  parent_type    :string
#

class UserFile < ActiveRecord::Base
  belongs_to :user
  belongs_to :biospecimen
  belongs_to :parent, {polymorphic: true}
  has_many :comparison_inputs
  has_many :comparisons, -> { distinct }, {through: :comparison_inputs, dependent: :restrict_with_exception}

  has_and_belongs_to_many :jobs_as_input, {join_table: "job_inputs", class_name: "Job"}

  def self.real_files
    return where.not(parent_type: 'Comparison')
  end

  def self.accessible_by(user_id)
    raise unless user_id.present?
    return where.any_of(user_id: user_id, public: true)
  end

  def deletable?
    return (comparisons.count == 0) && (parent_type == "User")
  end

end

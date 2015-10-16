# == Schema Information
#
# Table name: comparisons
#
#  id          :integer          not null, primary key
#  name        :string
#  description :text
#  user_id     :integer
#  public      :boolean
#  state       :string
#  dxjobid     :string
#  project     :string
#  meta        :text
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#

class Comparison < ActiveRecord::Base

  DEFAULT_APP = "app-pfda-compare"

  # comparison.user => returns the user who created the comparison
  belongs_to :user

  # comparison.user_files => returns the collection of UserFile
  # objects which participated in this comparison
  has_many :user_files, {through: :inputs}

  # comparison.inputs => returns the collection of ComparisonInput
  # objects associated with this comparison
  has_many :inputs, {class_name: "ComparisonInput", dependent: :destroy}

  # comparison.outputs => returns the UserFile objects that are
  # part of the comparison outputs. These UserFile objects have
  # 'parent' set to this comparison, hence do not participate
  # in usual UserFile queries as they don't match the default
  # scope of UserFile (which is set to 'parent_type != Comparison')
  has_many :outputs, {class_name: "UserFile", dependent: :restrict_with_exception, as: 'parent'}

  def self.accessible_by(user_id)
    raise unless user_id.present?
    return where.any_of(user_id: user_id, public: true)
  end

  def input(role)
    inputs.where(role: role).take
  end

  def input!(role)
    inputs.where(role: role).take!
  end

  def meta_hash
    JSON.parse(meta)
  end

  def stats
    meta_hash.slice("precision", "recall", "f-measure", "true-pos", "false-pos", "false-neg")
  end
end

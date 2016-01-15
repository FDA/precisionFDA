# == Schema Information
#
# Table name: comparisons
#
#  id          :integer          not null, primary key
#  name        :string
#  description :text
#  user_id     :integer
#  state       :string
#  dxjobid     :string
#  project     :string
#  meta        :text
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  scope       :string
#

class Comparison < ActiveRecord::Base
  include Permissions

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

  has_many :notes, {through: :attachments}
  has_many :attachments, {as: :item, dependent: :destroy}

  def uid
    "comparison-#{id}"
  end

  def title
    name
  end

  def klass
    "comparison"
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

  def deletable?
    state != "pending"
  end

  def publishable_by?(context)
    if context.guest?
      false
    else
      user_id == context.user_id && scope != "public" && state == "done"
    end
  end
end

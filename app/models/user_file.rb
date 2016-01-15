# == Schema Information
#
# Table name: user_files
#
#  id          :integer          not null, primary key
#  dxid        :string
#  project     :string
#  name        :string
#  state       :string
#  description :text
#  user_id     :integer
#  file_size   :integer
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  parent_id   :integer
#  parent_type :string
#  scope       :string
#

# Parent types:
# ------------
# User (for files externally uploaded)
# Job (for files generated from a job)
# Asset (for app assets)
# Comparison (for files generated from a comparison)
#
# Feature matrix
#
#                                | U | J | A | C
# -------------------------------+---+---+---+---
# Shows up in files#index        | Y | Y | N | N
# Shows up in files#show         | Y | Y | N | Y
# Can be deleted independently   | Y | Y | Y | N
# Can be published independently | Y | Y | Y | N
# Can be attached independently  | Y | Y | Y | N
#
# To help with the above, we define the following scopes
# real_files: U || J
# not_assets: U || J || C
# independent: U || J || A
#
class UserFile < ActiveRecord::Base
  include Permissions

  belongs_to :user
  belongs_to :parent, {polymorphic: true}
  has_many :notes, {through: :attachments}
  has_many :attachments, {as: :item, dependent: :destroy}
  has_many :comparison_inputs
  has_many :comparisons, -> { distinct }, {through: :comparison_inputs, dependent: :restrict_with_exception}

  has_and_belongs_to_many :jobs_as_input, {join_table: "job_inputs", class_name: "Job"}

  def self.real_files
    return where(parent_type: ['User', 'Job'])
  end

  def self.not_assets
    return where.not(parent_type: 'Asset')
  end

  def self.independent
    return where.not(parent_type: 'Comparison')
  end

  def self.closed
    return where(state: 'closed')
  end

  def uid
    dxid
  end

  def title
    parent_type == "Asset" ? self.becomes(Asset).prefix : name
  end

  def klass
    parent_type == "Asset" ? "asset" : "file"
  end

  def deletable?
    return ((parent_type == "User") || (parent_type == "Job"))
  end

  def publishable_by?(context)
    if context.guest?
      false
    else
      user_id == context.user_id && scope != "public" && parent_type != "Comparison" && state == "closed"
    end
  end
end

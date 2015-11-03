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
# Can be deleted independently   | Y | Y | * | N
# 
# To help with the above, we define the following scopes
# real_files: U || J
# not_assets: U || J || C
#
class UserFile < ActiveRecord::Base
  include Permissions

  belongs_to :user
  belongs_to :parent, {polymorphic: true}
  has_many :notes, {through: :attachments}
  has_many :attachments, {as: :item}
  has_many :comparison_inputs
  has_many :comparisons, -> { distinct }, {through: :comparison_inputs, dependent: :restrict_with_exception}

  has_and_belongs_to_many :jobs_as_input, {join_table: "job_inputs", class_name: "Job"}

  def self.real_files
    return where(parent_type: ['User', 'Job'])
  end

  def self.not_assets
    return where.not(parent_type: 'Asset')
  end

  def deletable?
    return (comparisons.count == 0) && ((parent_type == "User") || (parent_type == "Job"))
  end

end

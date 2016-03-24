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
  include Licenses
  require 'uri'

  belongs_to :user
  belongs_to :parent, {polymorphic: true}
  has_many :notes, {through: :attachments}
  has_many :attachments, {as: :item, dependent: :destroy}
  has_many :comparison_inputs
  has_many :comparisons, -> { distinct }, {through: :comparison_inputs, dependent: :restrict_with_exception}

  has_and_belongs_to_many :jobs_as_input, {join_table: "job_inputs", class_name: "Job"}

  has_one :licensed_item, {as: :licenseable, dependent: :destroy}
  has_one :license, {through: :licensed_item}
  has_many :accepted_licenses, {through: :license}

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

  def feedback(context)
    if uid == NIST_VCF_UID && context
      if context.guest?
        return "https://docs.google.com/forms/d/1cF0XoeGbLJUSRC3pvEz36DMdlpWA9nFwUXJA_o-oxrU/viewform?entry.556919704=NISTv2.19"
      else
        user_name = URI.encode_www_form_component(context.user.full_name)
        user_email = URI.encode_www_form_component(context.user.email)
        user_org = URI.encode_www_form_component(context.user.org.name)
        return "https://docs.google.com/forms/d/1cF0XoeGbLJUSRC3pvEz36DMdlpWA9nFwUXJA_o-oxrU/viewform?entry.764685280=#{user_name}&entry.1095215913=#{user_email}&entry.451016179=#{user_org}&entry.556919704=NISTv2.19"
      end
    else
      nil
    end
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

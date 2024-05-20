# == Schema Information
#
# Table name: licenses
#
#  id                :integer          not null, primary key
#  content           :text(65535)
#  user_id           :integer
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  title             :string(255)
#  scope             :string(255)
#  approval_required :boolean          default(FALSE), not null
#

class License < ApplicationRecord
  include Auditor
  include Permissions
  include CommonPermissions
  include Licenses
  include ObjectLocation

  belongs_to :user
  has_many :licensed_items, dependent: :destroy
  has_many :accepted_licenses, dependent: :destroy

  has_many :files, through: :licensed_items, source: :licenseable, source_type: "UserFile"
  has_many :assets, through: :licensed_items, source: :licenseable, source_type: "Asset"
  has_many :licensed_users, through: :accepted_licenses, source: :user
  has_many :dbclusters, through: :licensed_items, source: :licenseable, source_type: "DbCluster"

  acts_as_taggable

  def uid
    "license-#{id}"
  end

  def klass
    "license"
  end

  def to_param
    if title.nil?
      id.to_s
    else
      "#{id}-#{title.parameterize}"
    end
  end

  def publishable_by?(*)
    false
  end

  def rename(new_name, context)
    update(title: new_name)
  end

  def describe_fields
    %w(title content approval_required)
  end

  def accepted_licenses_pending
    accepted_licenses.where(state: "pending")
  end
end

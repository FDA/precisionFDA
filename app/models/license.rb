# == Schema Information
#
# Table name: licenses
#
#  id                :integer          not null, primary key
#  content           :text
#  user_id           :integer
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  title             :string
#  scope             :string
#  approval_required :boolean          default(FALSE), not null
#

class License < ActiveRecord::Base
  include Auditor
  include Permissions
  include Licenses

  belongs_to :user
  has_many :licensed_items, dependent: :destroy
  has_many :accepted_licenses, dependent: :destroy

  has_many :files, {through: :licensed_items, source: :licenseable, source_type: 'UserFile'}
  has_many :assets, {through: :licensed_items, source: :licenseable, source_type: 'Asset'}
  has_many :licensed_users, {through: :accepted_licenses, source: :user}

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

  def publishable_by?(context, scope_to_publish_to = "public")
    false
  end

  def rename(new_name, context)
    update_attributes(title: new_name)
  end

  def describe_fields
    ["title", "content", "approval_required"]
  end

  def accepted_licenses_pending
    accepted_licenses.where(state: 'pending')
  end
end

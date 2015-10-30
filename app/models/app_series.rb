# == Schema Information
#
# Table name: app_series
#
#  id                     :integer          not null, primary key
#  dxid                   :string
#  name                   :string
#  latest_revision_app_id :integer
#  latest_version_app_id  :integer
#  user_id                :integer
#  scope                  :string
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#

class AppSeries < ActiveRecord::Base
  has_many :apps
  has_many :jobs
  belongs_to :latest_revision_app, class_name: 'App'
  belongs_to :latest_version_app, class_name: 'App'
  belongs_to :user

  def self.accessible_by(user_id, org_id)
    raise unless user_id.present? && org_id.present?
    return where.any_of({user_id: user_id}, {scope: "public"}, {scope: org_id.to_s})
  end
end

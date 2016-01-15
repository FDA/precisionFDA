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
  include Permissions

  has_many :apps
  has_many :jobs
  belongs_to :latest_revision_app, class_name: 'App'
  belongs_to :latest_version_app, class_name: 'App'
  belongs_to :user

  def klass
    "app"
  end

  def self.construct_dxid(username, name)
    "app-#{construct_dxname(username, name)}"
  end

  def self.construct_dxname(username, name)
    "-#{username}-#{name}"
  end

  def accessible_revisions(context)
    apps.accessible_by(context).order(revision: :desc)
  end

  def latest_accessible(context)
    editable_by?(context) ? latest_revision_app : latest_version_app
  end

  def published
    apps.published
  end
end

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

  acts_as_votable
  acts_as_taggable

  SUGGESTED_TAGS = ["QC/Statistics", "Benchmarking", "Simulation", "Reads Pre-processing", "Read Mapping", "Variation Calling", "CNV/SV Calling", "Annotation", "Cancer"]

  def uid
    "app-series-#{id}"
  end

  def klass
    "app-series"
  end

  def title
    name
  end

  def describe_fields
    ["title"]
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

  def publishable_by?(context, scope_to_publish_to)
    # Not supposed to be called on app series
    false
  end

  def self.authorized_users_for_scope!(scope)
    if scope == "public"
      return [ORG_EVERYONE]
    else
      return Space.from_scope(scope).authorized_users_for_apps
    end
  end

  def self.publish(apps, context, scope)
    # Ensure API availability
    api = DNAnexusAPI.new(context.token)
    api.call("system", "greet")

    count = 0

    apps.uniq.each do |app|
      # It is possible for two different apps of the same app series
      # to try to get published, and we need to ensure that app.app_series
      # is reflecting the changes between the first and second app.
      app.reload

      next unless app.publishable_by?(context, scope)
      raise "Inconsistent scope (#{scope} vs #{app.app_series.scope}) for app #{app.dxid}" unless ["private", scope].include?(app.app_series.scope)

      # FIXME: This is outside of a transaction
      authorized_users = AppSeries.authorized_users_for_scope!(scope)
      api.call(app.dxid, 'addAuthorizedUsers', {"authorizedUsers": authorized_users})
      api.call(app.dxid, "publish")
      app.with_lock do
        if app.publishable_by?(context, scope)
          count += 1
          app.update!(scope: scope)
          series = app.app_series
          series_updates = {}
          series_updates[:scope] = scope if series.scope != scope
          series_updates[:latest_version_app_id] = app.id unless series.latest_version_app_id.present? && series.latest_version_app.revision > app.revision
          series.update!(series_updates) if series_updates.present?
          Event::AppPublished.create(app, scope, context.user)
        end
      end
    end

    return count
  end
end

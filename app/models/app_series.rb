# == Schema Information
#
# Table name: app_series
#
#  id                     :integer          not null, primary key
#  dxid                   :string(255)
#  name                   :string(255)
#  latest_revision_app_id :integer
#  latest_version_app_id  :integer
#  user_id                :integer
#  scope                  :string(255)
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  verified               :boolean          default(FALSE), not null
#

class AppSeries < ApplicationRecord
  paginates_per 15

  include Auditor
  include Permissions
  include CommonPermissions
  include Featured
  include SoftRemovable
  include TagsContainer

  has_many :apps
  has_many :jobs
  belongs_to :latest_revision_app, class_name: "App"
  belongs_to :latest_version_app, class_name: "App"
  belongs_to :user

  acts_as_votable

  alias_attribute :title, :name

  SUGGESTED_TAGS = [
    "QC/Statistics",
    "Benchmarking",
    "Simulation",
    "Reads Pre-processing",
    "Read Mapping",
    "Variation Calling",
    "CNV/SV Calling",
    "Annotation",
    "Cancer"
  ].freeze

  class << self
    # Returns apps count of user 'private' scope.
    # Is used in for user serializer in Home
    # @param [User] User object
    # @return [Integer] Apps count.
    # TODO: add rspec
    def private_count(user)
      count = 0
      app_series = accessible_by_private.
        where(user_id: user.id)
      app_series.each do |app_serie|
        latest = app_serie.latest_revision_app
        count += 1 if latest&.scope == "private" && latest&.not_deleted?
      end

      count
    end

    def construct_dxid(username, app_name, scope)
      "app-#{construct_dxname(username, app_name, scope)}"
    end

    def construct_dxname(username, app_name, scope)
      return "#{scope}-#{app_name}" if scope && Space.valid_scope?(scope)

      "-#{username}-#{app_name}"
    end

    def authorized_users_for_scope(scope)
      if scope == "public"
        [ORG_EVERYONE]
      else
        Space.from_scope(scope).authorized_users_for_apps
      end
    end

    # TODO: move this to a publish service
    def publish(apps, context, scope)
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

        unless ["private", scope].include?(app.app_series.scope)
          raise "Inconsistent scope (#{scope} vs #{app.app_series.scope}) for app #{app.dxid}"
        end

        authorize_users_for_app(api, app, scope)

        app.with_lock do
          if app.publishable_by?(context, scope)
            count += 1
            app.update!(scope: scope)
            series = app.app_series
            series_updates = {}
            series_updates[:scope] = scope

            if series.latest_version_app_id.blank? ||
               series.latest_version_app.revision < app.revision
              series_updates[:latest_version_app_id] = app.id
            end

            series.update!(series_updates)

            Event::AppPublished.create_for(app, scope, context.user)
            prepare_to_space(api, context, app, scope)
          end
        end
      end

      count
    end

    # TODO: move this to a publish service
    def authorize_users_for_app(api, app, scope)
      authorized_users = AppSeries.authorized_users_for_scope(scope)
      api.call(app.dxid, 'addAuthorizedUsers', { "authorizedUsers": authorized_users })
      api.call(app.dxid, "publish")
    end

    # TODO: move this to a service
    def prepare_to_space(api, context, app, scope)
      return unless scope =~ /^space-(\d+)$/

      space = Space.from_scope(scope)

      SpaceEventService.call($1.to_i, context.user_id, nil, app, :app_added)

      if space.review? || space.verification?
        api.call(app.dxid, 'addDevelopers', { "developers": [Setting.review_app_developers_org] })
      end
    end
  end

  def uid
    "app-series-#{id}"
  end

  def klass
    "app-series"
  end

  def describe_fields
    %w(title)
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
end

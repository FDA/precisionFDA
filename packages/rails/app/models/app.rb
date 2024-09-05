# == Schema Information
#
# Table name: apps
#
#  id            :integer          not null, primary key
#  dxid          :string(255)
#  version       :string(255)
#  revision      :integer
#  title         :string(255)
#  readme        :text(65535)
#  user_id       :integer
#  scope         :string(255)
#  spec          :text(65535)
#  internal      :text(65535)
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  app_series_id :integer
#  verified      :boolean          default(FALSE), not null
#  uid           :string(255)
#  dev_group     :string(255)
#  release       :string(255)      not null
#  entity_type   :integer          default("regular"), not null
#  featured      :boolean          default(FALSE)
#  deleted       :boolean          default(FALSE), not null
#

class App < ApplicationRecord
  include Auditor
  include Permissions
  include CommonPermissions
  include InternalUid
  include Featured
  include ObjectLocation
  include Scopes
  include SoftRemovable
  include TagsContainer

  TYPE_REGULAR = "regular".freeze
  TYPE_HTTPS = "https".freeze

  belongs_to :user
  has_one :org, through: :user

  belongs_to :app_series
  has_many :jobs
  has_many :attachments, as: :item, dependent: :destroy
  has_many :notes, through: :attachments
  has_many :properties, through: :app_series, source: :properties

  has_and_belongs_to_many :assets, join_table: "apps_assets"

  has_many :challenges

  before_update { |app| app.update_series_featured_status if app.featured_changed? }
  before_update { |app| app.update_series_deleted_status(app) if app.deleted_changed? }

  delegate :workstation_app_state?, to: :job, allow_nil: true

  attr_accessor :current_user

  store :spec, accessors: [ :input_spec, :output_spec, :internet_access, :instance_type ], coder: JSON
  store :internal, accessors: [ :ordered_assets, :packages, :code, :platform_tags ], coder: JSON

  acts_as_commentable

  VALID_IO_CLASSES = %w(file string boolean int float).freeze

  enum entity_type: {
    TYPE_REGULAR => 0,
    TYPE_HTTPS => 1,
  }

  def to_param
    uid
  end

  # Get an array of app's jobs, editable by a context user
  # Jobs are serialized.
  #  @param context [Context] The user context.
  #  @return jobs [Array of serialized Job objects.
  def accessible_jobs(context)
    app_series.jobs.
      accessible_by(context).
      includes(:taggings).
      order(created_at: :desc).
      map { |job| JobSerializer.new(job) }
  end

  # Scopes of files when an app is running out of spaces.
  def permitted_scopes
    [SCOPE_PRIVATE, SCOPE_PUBLIC]
  end

  # Scopes of files that can be used to run an app.
  def space_scopes
    return permitted_scopes if not_in_spaces

    space_object.accessible_scopes
  end

  # Check whether app is not in space of any type
  # @return [true, false]
  def not_in_spaces
    !in_space? || Space::TYPES.exclude?(space_object.space_type)
  end

  # Scopes that can be used to run an app.
  def available_job_spaces(user)
    return [] if not_in_spaces

    Space.joins(:space_memberships).
      where(
        id: [space_object.id, space_object.confidential_spaces.pluck(:id)].flatten,
        space_memberships: { user_id: user.id }
      )
  end

  def can_run_in_space?(user, space_id)
    return false if not_in_spaces

    # TODO: control disabled users!
    # member = space_object.space_memberships.active.where(user_id: user.id).first
    member = space_object.space_memberships.where(user_id: user.id).first
    return false unless member

    available_job_spaces(user).where(id: space_id).exists?
  end

  def klass
    "app"
  end

  def describe_fields
    ["title", "name", "version", "revision", "readme", "spec", "dxid"]
  end

  def versioned?
    version.present?
  end

  # Checks if app can be published or copied to a PUBLIC or SPACE scope.
  # @param context [Context] The user context.
  # @param scope_to_publish_to [String] The scope to publish to. Can be 'public' or 'space-xxx'
  # @return [Boolean] Returns true if an app is publishable by a user, false otherwise.
  def publishable_by?(context, scope_to_publish_to = SCOPE_PUBLIC)
    core_publishable_by?(context) &&
      private? &&
      (app_series.private? || app_series.scope == scope_to_publish_to)
  end

  # TODO: to be refactored.
  def accessible_by?(context)
    return true if super

    return false unless context.logged_in?
    return false unless context.review_space_admin?

    in_space? && (space_object.reviewer? || space_object.verification?)
  end

  def runnable_by?(user)
    accessible_by_user?(user) && (
      !in_space? ||
      SpaceMembershipPolicy.can_run_apps?(
        space_object,
        space_object.space_memberships.find_by(user: user),
      )
    )
  end

  def find_input(name)
    spec["input_spec"].select { |input| input["name"] == name }.first
  end

  def find_output(name)
    spec["output_spec"].select { |input| input["name"] == name }.first
  end

  # Exports app to Docker by building Dockerfile.
  # @param context_token [String] User's token.
  # @return [String] Built Dockerfile.
  def to_docker(context_token)
    api = DNAnexusAPI.new(context_token)
    exporter = DockerExporter.new(api, Rails.application.routes.url_helpers)
    exporter.call(self)
  end

  # Get all input spec's default file uids.
  # @return [Array<String>] File UIDs.
  def default_input_files
    input_spec.map { |input_spec| input_spec[:default] if input_spec[:class] == "file" }.compact
  end

  def in_locked_space?
    in_space? && space_object.locked?
  end

  def latest_accessible_in_scope?
    private? && self == app_series.latest_revision_app ||
      (in_space? || public?) && self == app_series.latest_version_app
  end

  def update_series_featured_status
    app_series.update(featured: featured)
  end

  def update_series_deleted_status(app)
    apps = app_series.apps.where(deleted: false).order(revision: :desc)
    if apps.length > 1
      latest_app = apps.find { |a| a.id != app.id }
      app_series.update(latest_revision_app: latest_app) if app.id == app_series.latest_revision_app_id
      app_series.update(featured: false) if !latest_app.featured && app_series.featured
      app_series.update(scope: latest_app.scope) if latest_app.scope != app_series.scope
      if app.id == app_series.latest_version_app_id && app.scope != SCOPE_PRIVATE
        latest_app_by_scope = apps.find { |a| a.id != app.id && a.scope == app.scope }
        app_series.update(latest_version_app: latest_app_by_scope)
      end
    elsif apps.length == 1
      app_series.update(featured: false)
      app_series.update(deleted:)
      app_series.update(latest_revision_app: nil)
      app_series.update(latest_version_app: nil)
      app_series.update(scope: nil)
    end
  end

  delegate :name, to: :app_series

  # Workstation API support

  def find_workstation_api_tag
    internal["platform_tags"]&.select { |input| input.starts_with?("pfda_workstation_api") }&.first
  end

  def has_workstation_api
    find_workstation_api_tag.present?
  end

  def workstation_api_version
    return find_workstation_api_tag.split(":").last if has_workstation_api
  end

  def has_https_app_state?
    internal["platform_tags"]&.select { |input| input.starts_with?("pfda_httpsAppState_enabled") }&.first.present?
  end
end
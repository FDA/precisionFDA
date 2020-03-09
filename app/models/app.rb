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
#

class App < ApplicationRecord
  include Auditor
  include Permissions
  include InternalUid
  include Scopes

  belongs_to :user
  belongs_to :app_series
  has_many :jobs
  has_many :attachments, as: :item, dependent: :destroy
  has_many :notes, through: :attachments

  has_and_belongs_to_many :assets, join_table: "apps_assets"

  has_many :challenges

  store :spec, accessors: [ :input_spec, :output_spec, :internet_access, :instance_type ], coder: JSON
  store :internal, accessors: [ :ordered_assets, :packages, :code ], coder: JSON

  acts_as_commentable

  VALID_IO_CLASSES = ["file", "string", "boolean", "int", "float"]

  def to_param
    uid
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
    !in_space? || !space_object.review? && !space_object.verification? && !space_object.groups?
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

  def name
    app_series.name
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

  def publishable_by?(context, scope_to_publish_to = SCOPE_PUBLIC)
    # App series must be private, otherwise must match scope
    core_publishable_by?(context, scope_to_publish_to) && private? && (app_series.private? || (app_series.scope == scope_to_publish_to))
  end

  def accessible_by?(context)
    return true if super

    return false unless context.logged_in?
    return false unless context.review_space_admin?

    space_object.reviewer? || space_object.verification?
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
end

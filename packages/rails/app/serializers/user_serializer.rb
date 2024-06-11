# User serializer.
class UserSerializer < ApplicationSerializer
  attributes(
    :id,
    :dxuser,
    :first_name,
    :last_name,
    :full_name,
    :email,
    :admin,
    :counters,
    :links,
    :is_guest,
    :gravatar_url,
    :job_limit,
    :pricing_map,
    :resources,
    :total_limit,
  )

  attribute :guest?, key: :is_guest
  attribute :can_administer_site?, key: :can_administer_site
  attribute :can_create_challenges?, key: :can_create_challenges
  attribute :can_see_spaces?, key: :can_see_spaces
  attribute :review_space_admin?, key: :review_space_admin
  attribute :can_access_notification_preference?, key: :can_access_notification_preference
  attribute :allowed_to_publish?, key: :allowed_to_publish

  has_one :org

  # Checks if a user has site admin role.
  # @return [Boolean] Returns true if a user is site admin, false otherwise.
  def admin
    object.site_admin?
  end

  # Returns user counters for related objects.
  # @return [Hash] User counters for files, apps, workflows, etc.
  def counters
    return {} if object.guest?

    {
      files: files_private_count,
      folders: folders_private_count,
      apps: apps_private_count,
      workflows: workflows_count,
      jobs: jobs_count,
      assets: assets_count,
      notes: notes_count,
    }
  end

  # Builds links to user.
  # @return [Hash] Links.
  def links
    return unless current_user && !current_user.guest?

    {}.tap do |links|
      # GET user accessible licenses list - show this link when current user has licenses
      links[:licenses] = api_list_licenses_path(object) unless current_user.licenses.empty?
    end
  end

  delegate :can_administer_site?, to: :object
  delegate :can_create_challenges?, to: :object
  delegate :can_see_spaces?, to: :object
  delegate :can_access_notification_preference?, to: :object
  delegate :review_space_admin?, to: :object
  delegate :allowed_to_publish?, to: :object

  delegate :full_name, to: :object
  delegate :gravatar_url, to: :object
end

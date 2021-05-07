# User serializer.
class UserSerializer < ApplicationSerializer
  attributes(
    :id,
    :dxuser,
    :first_name,
    :last_name,
    :email,
    :admin,
    :counters,
    :links,
    :is_guest,
  )

  attribute :guest?, key: :is_guest
  attribute :can_administer_site?, key: :can_administer_site
  attribute :can_create_challenges?, key: :can_create_challenges

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
end

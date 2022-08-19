# Space serializer.
# rubocop:disable Metrics/ClassLength
class SpaceSerializer < ApplicationSerializer
  delegate :all_tags_list, to: :object

  attributes(
    :id,
    :description,
    :state,
    :name,
    :type,
    :cts,
    :created_at,
    :updated_at,
    :counters,
    :links,
    :updatable,
  )

  attribute :space_type, key: :type

  attribute :space_id, key: :shared_space_id, if: lambda {
    object.confidential? && !object.private_type?
  }
  attribute :private_space_id, if: -> { object.shared? && confidential_space }
  attribute :all_tags_list, key: :tags

  attribute :can_duplicate, if: -> { object.review? }
  attribute :current_user_membership, key: :current_user_membership
  attribute :exclusive?, key: :private_exclusive, if: -> { object.private_type? }

  has_one :host_lead_member,
          key: :host_lead,
          serializer: SpaceMemberSerializer,
          if: -> { object.host_lead_member }

  has_one :guest_lead_member,
          key: :guest_lead,
          serializer: SpaceMemberSerializer,
          if: -> { object.guest_lead_member }

  has_one :confidential_space, serializer: self,
          if: -> { current_user && space_membership && (object.shared? || object.exclusive?) }

  # Builds links according to user permissions.
  # @return [Hash] Links.
  def links
    return unless current_user

    {}.tap do |links|
      links[:accept] = accept_api_space_path(object) if can_accept?
      links[:add_data] = add_data_api_space_path(object) if can_edit?
      links[:show] = api_space_path(object) if can_access? || current_user.review_space_admin?
      links[:delete] = delete_api_space_path(object) if can_delete?
      links[:lock] = lock_api_space_path(object) if can_lock?
      links[:unlock] = unlock_api_space_path(object) if can_unlock?
      links[:update] = api_space_path(object) if can_update?
      links[:update_tags] = tags_api_space_path(object) if can_update?
      links[:apps] = api_apps_path(object) if can_access?
      links[:files] = api_files_path(object) if can_access?
      links[:workflows] = api_workflows_path(object) if can_access?
      links[:jobs] = api_jobs_path(object) if can_access?
      links[:members] = members_api_space_path(object) if can_access?
      links[:show_shared] = api_space_path(object.space) if object.confidential?

      if object.shared? && confidential_space
        links[:show_private] = api_space_path(confidential_space)
      end
    end
  end

  def private_space_id
    confidential_space.id
  end

  # Returns formatted created_at time.
  # @return [String] Formatted time.
  def created_at
    formatted_time(object.created_at)
  end

  # Returns formatted updated_at time.
  # @return [String] Formatted time.
  def updated_at
    formatted_time(object.updated_at)
  end

  # Returns space counters for related objects.
  # @return [Hash] Space counters for members, files and notes, apps, comments.
  def counters
    {
      files: files_count,
      apps: apps_count,
      workflows: workflows_count,
      jobs: jobs_count,
      members: members_count,
    }
  end

  # Returns a private (confidential) review space.
  # @return [Space] Private review space.
  def confidential_space
    space_membership && object.confidential_space(space_membership)
  end

  # Checks if user is a space member, and returns that member
  # @return [SpaceMembership]
  def current_user_membership
    space_membership
  end

  def can_duplicate
    SpaceMembershipPolicy.can_duplicate?(object, space_membership)
  end

  # Checks if current user is able to update a space.
  # @return [Boolean] Returns true if user can update a space, false otherwise.
  # When updatable is true - it means that a user can Add new members, at least...
  # This is a call for a model method space.updatable_by?(user), since we have can_update? here
  def updatable
    can_update?
  end

  private

  # Returns apps count.
  # @return [Integer] Apps count.
  def apps_count
    object.latest_revision_apps.unremoved.count
  end

  # Returns files count.
  # @return [Integer] Files count.
  def files_count
    object.files.count
  end

  # Returns jobs count.
  # @return [Integer] Jobs count.
  def jobs_count
    object.jobs.count
  end

  # Returns space members count.
  # @return [Integer] Space members count.
  def members_count
    object.space_memberships.count
  end

  # Returns workflows count.
  # @return [Integer] Workflows count.
  def workflows_count
    object.workflows.unremoved.count
  end

  # Returns current user space membership
  # @return [SpaceMembership] Space membership.
  def space_membership
    object.space_memberships.active.find_by(user: current_user)
  end

  # Checks if user is able to accept a space.
  # @return [Boolean] Returns true if user is able to accept a space, false otherwise.
  def can_accept?
    SpaceMembershipPolicy.can_accept?(object, space_membership)
  end

  # Checks if user is able to update a space.
  # @return [Boolean] Returns true if user is able to update a space, false otherwise.
  def can_update?
    object.updatable_by?(current_user)
  end

  # Checks if user is able to access a space.
  # @param space [Space] A space.
  # @return [Boolean] Returns true if user is able to access a space, false otherwise.
  def can_access?(space = object)
    space.accessible_by_user?(current_user)
  end

  # Checks if user is able to lock a space.
  # @return [Boolean] Returns true if user is able to lock a space, false otherwise.
  def can_lock?
    SpaceRequestPolicy.can_lock?(current_user, object)
  end

  # Checks if user is able to unlock a space.
  # @return [Boolean] Returns true if user is able to unlock a space, false otherwise.
  def can_unlock?
    SpaceRequestPolicy.can_unlock?(current_user, object)
  end

  # Checks if user is able to add content to space.
  # @return [Boolean] Returns true if user is able to add content to space, false otherwise.
  def can_edit?
    object.editable_by?(current_user)
  end

  alias_method :can_delete?, :can_unlock?
end
# rubocop:enable Metrics/ClassLength

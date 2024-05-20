# Top-level application serializer.
class ApplicationSerializer < ActiveModel::Serializer
  include Rails.application.routes.url_helpers

  # dxuser of a current user logged
  def logged_dxuser
    object.current_user&.dxuser
  end

  # current user logged
  def logged_user
    object.current_user
  end

  # license of the file with selected attributes
  # when file does not have license - return {}
  def file_license
    object.license&.slice(:id, :uid, :title) || {}
  end

  # Returns license pending status for the object
  # @return [show_license_pending] true or false
  def show_license_pending
    if object.license&.approval_required
      object.license_status?(current_user, "pending")
    else
      false
    end
  end

  # Check whether object could be licensed - means,
  # current_user is the owner of the object, independently of object scope
  def licenseable
    object.user.id == current_user.id
  end

  # Checks if user is able to access a space.
  # @param space [Space] A space.
  # @return [Boolean] Returns true if user is able to access a space, false otherwise.
  def can_access?(accessible_object)
    accessible_object.accessible_by_user?(logged_user)
  end

  # Returns formatted created_at time.
  # @return [String] Formatted time.
  def created_at_date_time
    formatted_date_time(object.created_at)
  end

  # Returns a user as a space member
  def current_membership
    @current_membership ||= begin
      object.user && object.space_object.space_memberships.active.find_by(user: object.user)
    end
  end

  # Check if a user - space member - has 'viewer' role
  def member_viewer?
    current_membership&.role == "viewer" if object.in_space?
  end

  # Check if a user - space member - has 'lead' role
  def member_lead?
    current_membership&.role == "lead"
  end

  # POST
  # Returns url for object tracking.
  # @param object.uid [String]
  # @return [String] url.
  def publish_object
    "/publish?id=#{object.uid}"
  end

  # Returns a user who has created this app.
  # @return [String] User full_name.
  def added_by_fullname
    object.user.full_name
  end

  # Returns a user who has created this app.
  # @return [String] User dxuser.
  def added_by
    object.user.dxuser
  end

  # A method for constructing a space specific path, if app is in space
  # @return [String] Space object UI url
  def space_path
    "/spaces/#{object.space_object.id}"
  end

  # Returns apps count of user 'private' scope.
  # @return [Integer] Apps count.
  def apps_private_count
    AppSeries.private_count(object)
  end

  # Returns files count of user 'private' scope in all folders.
  # @return [Integer] Files count.
  def files_private_count
    object.user_files.private_count(object)
  end

  # Returns all folders count of user 'private' scope.
  # @return [Integer] Folder count.
  def folders_private_count
    Folder.private_count(object)
  end

  # Returns jobs count of 'private' scope.
  # @return [Integer] Jobs count.
  def jobs_count
    object.jobs.accessible_by_private.count
  end

  # Returns workflows count of user 'private' scope.
  # @return [Integer] Workflows count.
  def workflows_count
    WorkflowSeries.private_count(object)
  end

  # Returns assets count of 'private' scope.
  # @return [Integer] Assets count.
  def assets_count
    object.assets.accessible_by_private.count
  end

  # Returns notes count of 'private' scope.
  # @return [Integer] notes count.
  def notes_count
    object.notes.accessible_by_private.count
  end

  protected

  # Returns formatted time.
  # @param time [Time, DateTime] Time object.
  # @return [String] Formatted time.
  def formatted_time(time)
    time.strftime("%m/%d/%Y")
  end

  # Returns formatted time.
  # @param time [Time, DateTime] Time object.
  # @return [String] Formatted time with separate Date, Time and Zone.
  def formatted_date_time(time)
    time.strftime("%Y-%m-%d %H:%M:%S %Z")
  end
end

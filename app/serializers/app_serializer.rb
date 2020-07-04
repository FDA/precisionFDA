# App serializer.
class AppSerializer < ApplicationSerializer
  attributes(
    :id,
    :name,
    :title,
    :added_by,
    :created_at,
    :revision,
    :run_by_you,
    :org,
    :explorers,
    :links,
  )

  attribute :all_tags_list, key: :tags

  # Returns an app user org handle.
  # @return [String] handle.
  def org
    object.org&.handle
  end

  # Returns a quantity of explorers of app.
  # @return [Integer] A quantity.
  def explorers
    object.app_series.jobs.distinct.select(:user_id).count
  end

  # Returns a string with text explanation about previous runnnings of the app by current_user.
  # @return [String, nil] Text explanation or nil if app's space is locked.
  def run_by_you
    return unless can_run?

    if run_by_you?
      "Yes"
    elsif app_ids.present?
      "Not this revision"
    elsif !object.in_locked_space?
      "Try"
    end
  end

  # Returns a user who has created this app.
  # @return [String] User dxuser.
  def added_by
    object.user.dxuser
  end

  # Returns formatted created_at time.
  # @return [String] Formatted time.
  def created_at
    formatted_time(object.created_at)
  end

  # Builds links.
  # @return [Hash] Links.
  def links
    return unless current_user

    {}.tap do |links|
      links[:show] = app_path(object)
      links[:user] = user_path(added_by)

      if can_run? && !run_by_you? && app_ids.empty? && !object.in_locked_space?
        links[:run_job] = new_app_job_path(object.app_series.latest_version_app)
      end
    end
  end

  private

  # Checks if user has permissions to run the app.
  # @return [Boolean] Returns true if a user can run the app, false otherwise.
  def can_run?
    return false unless current_user

    object.runnable_by?(current_user)
  end

  # Returns an array of apps ids which have jobs, runned by current_user.
  # @return [Array<Integer>] App IDs.
  def app_ids
    return [] unless current_user

    object.app_series.jobs.where(user: current_user).select(:app_id).distinct.map(&:app_id)
  end

  def run_by_you?
    app_ids.include?(object.app_series.latest_version_app_id)
  end
end

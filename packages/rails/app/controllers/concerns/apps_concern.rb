# App concern.
module AppsConcern
  # Finds an app by uid, accessible by current user.
  # @param id [Integer]
  # @return [app] An app Object if it is accessible by user.
  #   raise ApiError if not.
  def find_app
    @app = App.accessible_by(@context).unremoved.find_by(uid: unsafe_params[:id])

    raise ApiError, I18n.t("app_not_accessible") if @app.nil?

    @app
  end

  # Loads app revions and sets appropriate instance variable.
  def load_revisions
    @revisions = @app.
      app_series.
      accessible_revisions(@context).
      select(:title, :id, :uid, :revision, :version, :deleted)
  end

  # Loads common app relations and sets appropriate instance variables.
  def load_challenges
    @assigned_challenges = Challenge.
      where(app_id: @app.id).
      order(created_at: :desc)

    @assignable_challenges = Challenge.
      all.
      order(created_at: :desc).
      select { |c| c.can_assign_specific_app?(@context, @app) }
  end
end

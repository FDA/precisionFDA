# App concern.
module AppsConcern
  # Finds an app by uid, accessible by current user.
  # @param id [Integer]
  # @return [app] An app Object if it is accessible by user.
  #   raise ApiError if not.
  def find_app
    id = unsafe_params[:id]
    if id.start_with?("app-series-")
      app_series_id = id.split("-").last
      app_series = AppSeries.accessible_by(@context).find_by(id: app_series_id)
      raise ApiError, I18n.t("app_not_accessible") if app_series.nil?

      @app = app_series.latest_revision_app

      return @app
    end
    @app = App.accessible_by(@context).unremoved.find_by(uid: id)

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

class CopyService
  class AppCopier

    def initialize(api:, user:)
      @api = api
      @user = user
    end

    def copy(app, scope)
      new_app = app.dup
      new_app.scope = scope
      new_app.revision = 1
      new_app.save!

      copy_dependencies(new_app, app, scope)
      new_app
    end

    private

    attr_reader :api, :user

    def copy_dependencies(new_app, app, scope)
      copy_app_series(new_app, app, scope)
    end

    def copy_app_series(new_app, app, scope)
      new_app_series = app.app_series.dup
      new_app_series.latest_revision_app = new_app
      new_app_series.latest_version_app = new_app
      new_app_series.scope = scope
      new_app.app_series = new_app_series
      new_app.save!
    end

  end
end

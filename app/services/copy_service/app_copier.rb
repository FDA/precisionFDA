class CopyService
  class AppCopier
    def initialize(api:, user:, file_copier: nil)
      @api = api
      @user = user
      @file_copier = file_copier || FileCopier.new(api: api, user: user)
    end

    def copy(app, scope)
      new_app = app.dup
      new_app.scope = scope
      new_app.revision = 1

      copy_dependencies(new_app, app, scope)

      original = App.order(:id).find_by_dxid(new_app.dxid)
      publish(new_app, scope) unless original.scope == 'public'

      new_app.save!
      new_app
    end

    private

    attr_reader :api, :user, :file_copier

    def copy_dependencies(new_app, app, scope)
      copy_app_series(new_app, app, scope)
      copy_assets(new_app, app, scope)
    end

    def copy_app_series(new_app, app, scope)
      new_app_series = app.app_series.dup
      new_app_series.latest_revision_app = new_app
      new_app_series.latest_version_app = new_app
      new_app_series.scope = scope
      new_app.app_series = new_app_series
    end

    def copy_assets(new_app, app, scope)
      return if app.ordered_assets.blank?

      copies = file_copier.copy(app.assets, scope)
      new_app.assets = copies.all

      new_app.ordered_assets = app.ordered_assets.map do |ordered_uid|
        copies.find { |_, source| source.uid == ordered_uid }.file.uid
      end
    end

    def publish(app, scope)
      api.call(app.dxid, 'addAuthorizedUsers',
        "authorizedUsers": AppSeries.authorized_users_for_scope!(scope),)
    end
  end
end

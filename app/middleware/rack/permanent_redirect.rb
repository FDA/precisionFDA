module Rack
  class PermanentRedirect

    def initialize(app)
      @app = app
    end

    def call(env)
      new_path = match_new_path(Rack::Request.new(env).path)

      if new_path.present?
        permanent_redirect(new_path)
      else
        @app.call(env)
      end
    end

    private

    def match_new_path(path)
      match_file_path(path) || match_app_path(path)
    end

    def match_file_path(path)
      return unless path =~ /^\/files\/(file-.{24})$/

      file = UserFile.find_by_dxid($1)
      Rails.application.routes.url_helpers.file_path(file) if file.present?
    end

    def match_app_path(path)
      return unless path =~ /^\/apps\/(app-.{24})$/

      app = App.find_by_dxid($1)
      Rails.application.routes.url_helpers.app_path(app) if app.present?
    end

    def permanent_redirect(location)
      [301, { 'Location' => location, 'Content-Type' => 'text/html' }, ['Moved Permanently']]
    end

  end
end

module Rack
  class PermanentRedirect
    def initialize(app)
      @app = app
    end

    def call(env)
      new_path = match_file_path(Rack::Request.new(env).path)

      return permanent_redirect(new_path) if new_path

      @app.call(env)
    end

    private

    # This redirect is only needed for truth challenge results page
    def match_file_path(path)
      return unless path =~ %r{^/home/files/(file-.{24})$}

      file = UserFile.find_by(dxid: Regexp.last_match(1))
      "/home/files/#{file.uid}" if file
    end

    def permanent_redirect(location)
      [301, { "Location" => location, "Content-Type" => "text/html" }, ["Moved Permanently"]]
    end
  end
end

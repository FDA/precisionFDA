# The controller is used for proxying authorized GSRS requests.
class GinasAuthorizedController < ApplicationController
  include ReverseProxy::Controller

  GSRS_URL = ENV.fetch("GSRS_URL", "http://localhost:8080")

  def close_login_window
    render html: <<-HTML.html_safe
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Close Window</title>
        <script>
          window.onload = function() {
            // Close the window immediately after it loads
            window.close();
          };
        </script>
      </head>
      <body>
        <p>Login successful!</p>
      </body>
      </html>
    HTML
  end

  def whoami
    reverse_proxy GSRS_URL,
                  path: request.fullpath,
                  headers: {
                    AUTHENTICATION_USERNAME: current_user.username,
                    AUTHENTICATION_EMAIL: current_user.email,
                  } do |config|
      config.on_error do |code, response|
        logger.error "Received GSRS error for path #{request.fullpath}: #{response.body}, code: #{code}"
      end
    end
  end

  def substances
    substance_creator = Ginas::SubstanceFileCreator.new(@context)

    begin
      file = substance_creator.create_and_upload_file(request)
    rescue StandardError => e
      msg = "Can't create a substance file for #{current_user.dxuser}, encountered: #{e}"
      logger.error msg
      render(plain: msg, status: :unprocessable_entity) && return
    end

    render json: { fileUrl: "#{HOST}/home/files/#{file.uid}" }
  end
end

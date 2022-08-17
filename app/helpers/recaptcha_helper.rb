# Helper function for validating ReCaptcha token in Enterprise Recaptcha verification flow
module RecaptchaHelper
  def verify_captcha_assessment(token, action, minimal_score = 0.7)
    return true if Utils.development_or_test?

    # rubocop:disable Layout/LineLength
    uri = URI("https://recaptchaenterprise.googleapis.com/v1/projects/#{ENV['RECAPTCHA_PROJECT_ID']}/assessments?key=#{ENV['RECAPTCHA_API_KEY']}")
    # rubocop:enable Layout/LineLength
    site_key = ENV["RECAPTCHA_SITE_KEY"]

    header = { "Content-Type": "application/json" }
    body = {
      event: {
        token: token,
        siteKey: site_key,
        expectedAction: action,
        },
    }

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    request = Net::HTTP::Post.new(uri.request_uri, header)
    request.body = body.to_json

    response = http.request(request)
    result = JSON.parse(response.body)

    result.dig("tokenProperties", "valid") &&
      result.dig("tokenProperties", "action") == action &&
      result.dig("riskAnalysis", "score") > minimal_score
  end
end

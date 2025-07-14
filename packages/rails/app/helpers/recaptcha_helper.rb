# Helper function for validating ReCaptcha token in Enterprise Recaptcha verification flow
module RecaptchaHelper
  def verify_captcha_assessment(token, action, user_ip, user_agent, minimal_score = 0.7)
    # Early return for development/test environments
    return true if Utils.development_or_test?

    begin
      result = perform_recaptcha_request(token, action, user_ip, user_agent)
      is_valid = analyze_recaptcha_response(result, action, minimal_score)

      if is_valid
        risk_score = result.dig("riskAnalysis", "score")
        Rails.logger.info "[RECAPTCHA] PASSED - Action: '#{action}', Score: #{risk_score}, Threshold: #{minimal_score}"
      end

      return is_valid
    rescue StandardError => e
      Rails.logger.error "[RECAPTCHA] Verification failed due to an exception: #{e.class} - #{e.message}"
      false
    end
  end

  private

  def perform_recaptcha_request(token, action, user_ip, user_agent)
    uri = build_recaptcha_uri
    request_body = build_request_body(token, action, user_ip, user_agent)

    response = make_http_request(uri, request_body)

    unless response.is_a?(Net::HTTPSuccess)
      error_msg = "HTTP #{response.code}: #{response.message}"
      Rails.logger.error "[RECAPTCHA] API request failed: #{error_msg}"
      raise "reCAPTCHA API request failed: #{error_msg}"
    end

    JSON.parse(response.body)
  end

  # This method logs the specific reason for failure before returning false.
  def analyze_recaptcha_response(result, expected_action, minimal_score)
    # Check for a top-level API error first
    if (error = result["error"])
      Rails.logger.error "[RECAPTCHA] FAILED - API returned an error: #{error}"
      return false
    end

    # Extract key values for validation
    token_valid = result.dig("tokenProperties", "valid")
    actual_action = result.dig("tokenProperties", "action")
    risk_score = result.dig("riskAnalysis", "score")
    risk_score_reasons = result.dig("riskAnalysis", "reasons")
    invalid_reason = result.dig("tokenProperties", "invalidReason")

    # Check if the token is considered valid by Google
    unless token_valid
      Rails.logger.warn "[RECAPTCHA] FAILED - Token was invalid. Reason: '#{invalid_reason}'"
      return false
    end

    # Check if the action in the token matches the action we expected
    if actual_action != expected_action
      Rails.logger.warn "[RECAPTCHA] FAILED - Action mismatch. Expected: '#{expected_action}', Got: '#{actual_action}'"
      return false
    end

    # Check if the risk score meets our minimum threshold
    unless score_is_sufficient?(risk_score, minimal_score)
      Rails.logger.warn "[RECAPTCHA] FAILED - Score of '#{risk_score}' is below the set threshold of #{minimal_score} for action '#{expected_action}' - reasons: '#{risk_score_reasons}."
      return false
    end

    # The token is valid and meets all criteria
    true
  end

  def score_is_sufficient?(score, minimal_score)
    score.is_a?(Numeric) && score >= minimal_score
  end

  def build_recaptcha_uri
    project_id = ENV.fetch("RECAPTCHA_PROJECT_ID")
    api_key = ENV.fetch("RECAPTCHA_API_KEY")
    URI("https://recaptchaenterprise.googleapis.com/v1/projects/#{project_id}/assessments?key=#{api_key}")
  end

  def build_request_body(token, action, user_ip, user_agent)
    {
      event: {
        token: token,
        siteKey: ENV.fetch("RECAPTCHA_SITE_KEY"),
        expectedAction: action,
        userIpAddress: user_ip,
        userAgent: user_agent,
      }
    }
  end

  def make_http_request(uri, request_body)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.open_timeout = 10 # 10 seconds connection timeout
    http.read_timeout = 10 # 10 seconds read timeout

    request = Net::HTTP::Post.new(uri.request_uri, { "Content-Type" => "application/json" })
    request.body = request_body.to_json

    Timeout.timeout(20) do
      http.request(request)
    end
  end
end

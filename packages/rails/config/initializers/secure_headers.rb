# rubocop:disable Lint/PercentStringArray
SecureHeaders::Configuration.default do |config|
  # This header says "From now on, for max-age seconds enforce https protocol on this domain"
  # Causing problems with other apps (that do not support https) running on our development devices
  hsts_max_age = 20.years.to_i
  hsts_max_age = 0 if Rails.env.development? && ActiveRecord::Type::Boolean.new.cast(ENV.fetch("DISABLE_HSTS", false))
  config.hsts = "max-age=#{hsts_max_age}; includeSubDomains; preload"

  config.x_frame_options = "SAMEORIGIN"
  config.x_content_type_options = "nosniff"
  config.x_xss_protection = "1; mode=block"
  config.x_download_options = "noopen"
  config.x_permitted_cross_domain_policies = "none"
  config.referrer_policy = "no-referrer-when-downgrade"
  config.cookies = SecureHeaders::OPT_OUT
  config.csp = {
    base_uri: %w('self'),
    block_all_mixed_content: true, # see [http://www.w3.org/TR/mixed-content/](http://www.w3.org/TR/mixed-content/)
    child_src: %w('self' https://www.youtube.com blob:),
    # "data:" is necessary because of the Ketcher in GSRS
    connect_src: %w(
      'self'
      wss://localhost:*
      wss://precisionfda-dev.dnanexus.com
      wss://precisionfda-staging.dnanexus.com
      wss://precisionfda-staging.dnanexus.com
      wss://precision.fda.gov
      https://dnanexus-platform-upload-prod.s3.amazonaws.com
      https://dnanexus-platform-upload-prod.s3-fips.us-east-1.amazonaws.com
      https://dnanexus-platform-upload-stg.s3.amazonaws.com
      https://dnanexus-platform-upload-stg.s3-fips.us-east-1.amazonaws.com
      https://s3.amazonaws.com
      https://stagingdl.dnanex.us
      https://dl.dnanex.us
      https://api.dnanexus.com
      data:
    ),
    default_src: %w(https: 'self'),
    font_src: %w('self' https://fonts.gstatic.com https://cdnjs.cloudflare.com),
    form_action: %w('self' https://stagingdl.dnanex.us https://dl.dnanex.us),
    frame_ancestors: %w('self'),
    frame_src: %w(
      'self'
      https://www.youtube.com
      https://www.google.com
      https://www.gstatic.com
      https://www.recaptcha.net/recaptcha/
    ),
    img_src: %w(* data:),
    media_src: %w('self'),
    object_src: %w('none'),
    script_src: %w(
      'self'
      'unsafe-inline'
      'unsafe-eval'
      https://www.gstatic.com
      https://www.google.com
      https://www.google-analytics.com
      https://cdnjs.cloudflare.com
      https://www.youtube.com
      https://s.ytimg.com
      https://dnanexus.github.io
      https://www.recaptcha.net/recaptcha/
      https://www.gstatic.com/recaptcha/
    ),
    script_src_elem: %w(
      'self'
      'unsafe-inline'
      'unsafe-eval'
      https://drugs.ncats.io
      https://dnanexus.github.io
      https://www.recaptcha.net/recaptcha/
      https://www.gstatic.com/recaptcha/
    ),
    style_src: %w(
      'self' 'unsafe-inline'
      https://fonts.googleapis.com
      https://dnanexus.github.io
      https://cdnjs.cloudflare.com
    ),
    report_only: false,
  }
end
# rubocop:enable Lint/PercentStringArray

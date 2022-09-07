# rubocop:disable Lint/PercentStringArray
SecureHeaders::Configuration.default do |config|
  config.hsts = "max-age=#{20.years.to_i}; includeSubDomains; preload"
  config.x_frame_options = "DENY"
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
    connect_src: %w(
      'self'
      https://dnanexus-platform-upload-prod.s3.amazonaws.com
      https://dnanexus-platform-upload-prod.s3-fips.us-east-1.amazonaws.com
      https://dnanexus-platform-upload-stg.s3.amazonaws.com
      https://dnanexus-platform-upload-stg.s3-fips.us-east-1.amazonaws.com
      https://s3.amazonaws.com
      https://stagingdl.dnanex.us
      https://dl.dnanex.us
      https://api.dnanexus.com
    ),
    default_src: %w(https: 'self'),
    font_src: %w('self' https://fonts.gstatic.com https://cdnjs.cloudflare.com),
    form_action: %w('self' https://stagingdl.dnanex.us https://dl.dnanex.us),
    frame_ancestors: %w('none'),
    frame_src: %w(
      'self'
      https://www.youtube.com
      https://www.google.com
      https://www.gstatic.com
      https://www.recaptcha.net/recaptcha/
    ),
    img_src: %w(* data:),
    media_src: %w('self'),
    object_src: %w('self'),
    plugin_types: %w(application/x-shockwave-flash application/pdf),
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
    style_src: %w(
      'self' 'unsafe-inline'
      https://fonts.googleapis.com
      https://dnanexus.github.io
      https://cdnjs.cloudflare.com
    ),
    report_only: false
  }
end
# rubocop:enable Lint/PercentStringArray

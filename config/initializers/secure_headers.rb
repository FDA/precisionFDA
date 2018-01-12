SecureHeaders::Configuration.default do |config|
  config.hsts = "max-age=#{20.years.to_i}; includeSubDomains; preload"
  config.x_frame_options = "DENY"
  config.x_content_type_options = "nosniff"
  config.x_xss_protection = "1; mode=block"
  config.x_download_options = "noopen"
  config.x_permitted_cross_domain_policies = "none"
  config.csp = {
    base_uri: %w('self'),
    block_all_mixed_content: true, # see [http://www.w3.org/TR/mixed-content/](http://www.w3.org/TR/mixed-content/)
    child_src: %w('self' https://www.youtube.com blob:),
    connect_src: %w('self' https://dnanexus-platform-upload-prod.s3.amazonaws.com https://dnanexus-platform-upload-stg.s3.amazonaws.com https://s3.amazonaws.com https://stagingdl.dnanex.us https://dl.dnanex.us https://api.dnanexus.com),
    default_src: %w(https: 'self'),
    font_src: %w('self' https://fonts.gstatic.com https://cdnjs.cloudflare.com),
    form_action: %w('self' https://stagingdl.dnanex.us https://dl.dnanex.us),
    frame_ancestors: %w('none'),
    frame_src: %w('self' https://www.youtube.com https://www.google.com https://www.gstatic.com),
    img_src: %w(* data:),
    media_src: %w('self'),
    object_src: %w('self'),
    plugin_types: %w(application/x-shockwave-flash application/pdf),
    script_src: %w('self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.google.com https://www.google-analytics.com https://cdnjs.cloudflare.com https://www.youtube.com https://s.ytimg.com https://dnanexus.github.io),
    style_src: %w('self' 'unsafe-inline' https://fonts.googleapis.com https://dnanexus.github.io https://cdnjs.cloudflare.com),
    report_only: false
  }
  hpkp = {
    report_only: false,
    max_age: 5.minutes.to_i,
    include_subdomains: false
  }
  if ENV["DNANEXUS_BACKEND"] == "production"
    hpkp[:pins] = [
      {sha256: 'fxEEsh8jbNNYeHp09gkzFaRSpr6MYOAQRoRtGkMnw+c='},
      {sha256: 'OV/2vGzq4A/PlbCUFpy5W2dHmMLPvHZ9N/FVDOPNvQw='},
      {sha256: 'Hxbr0eK3F0xc4UkeXRvapzSvj3I0efJ+2h2Q70MpltM='},
      {sha256: 'AGLBxCqwOTXOZg/v14oxVzHbU0GVWr1QlHR7DQqnzvU='},
      {sha256: '154XxB1J9PKgQ2rcgEEsTY+0CPdx03PpIiiJPlJzAXk='}
    ]
    hpkp[:max_age] = 7.days.to_i
  else
    hpkp[:pins] = [
      {sha256: 'gtfblKFG3oCmgxfjddilwzBgaudaW3XyH7M90LrfjOU='},
      {sha256: 'x8W1sshBVav03Hgxxp+PRD5f3xs0yIBmNpph3krjGqM='},
      {sha256: 'TZqk8OpJ8n7+4M25OqUSfDZ+917bcso0RVa4ZMvdvXQ='}
    ]
  end
  config.hpkp = hpkp
end

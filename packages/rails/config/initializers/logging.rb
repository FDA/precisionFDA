Rails.application.config.log_tags = [
  proc do |req|
    "user_id: #{req.session['user_id'] || 'unknown'}"
  end,
]

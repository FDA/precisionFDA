require "sidekiq/web"

Rails.application.config.session_store :cookie_store, key: '_precision-fda_session'

# Turn off Sidekiq's sessions, which overwrite the main Rails app's session
# after the first request (https://github.com/mperham/sidekiq/issues/3377)
Sidekiq::Web.disable(:sessions)

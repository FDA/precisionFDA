require "sidekiq/web"

Rails.application.config.session_store :cookie_store, key: "_precision-fda_session"

module Profiles
  class EmailSynchronizer < ApplicationService
    def initialize(user, token)
      @user = user
      @token = token
    end

    def call
      return false if user.blank? || token.blank? || user.dxuser.blank?

      platform_email = fetch_platform_email
      return false if platform_email.blank?

      synchronize_email!(platform_email)
      true
    rescue DXClient::Errors::DXClientError, StandardError => e
      Rails.logger.warn("[Profiles::EmailSynchronizer] failed for user_id=#{user&.id}: #{e.message}")
      false
    end

    private

    attr_reader :user, :token

    def fetch_platform_email
      api = DNAnexusAPI.new(token)
      describe = api.user_describe("user-#{user.dxuser}")
      describe['email']&.strip&.downcase
    end

    def synchronize_email!(platform_email)
      User.transaction do
        sync_user_email(platform_email)

        profile = user.profile
        next if profile.blank?

        sync_profile_email(profile, platform_email)
      end
    end

    def sync_user_email(platform_email)
      user_changed = false

      if user.normalized_email != platform_email
        user.normalized_email = platform_email
        user_changed = true
      end

      if user.respond_to?(:email) && user.email != platform_email
        user.email = platform_email
        user_changed = true
      end

      user.save!(validate: false) if user_changed
    end

    def sync_profile_email(profile, platform_email)
      profile_email = profile.email.to_s.downcase

      if profile_email == platform_email
        profile.email_confirmed = true unless profile.email_confirmed?
        profile.save!(validate: false) if profile.changed?
        return
      end

      return unless profile.email_confirmed?

      profile.email = platform_email
      profile.save!(validate: false) if profile.changed?
    end
  end
end


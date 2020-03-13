# == Schema Information
#
# Table name: settings
#
#  id    :integer          not null, primary key
#  key   :string(255)      not null
#  value :text(65535)      not null
#

# Implements simple key-value settings storage.
class Setting < ApplicationRecord
  include Auditor

  USAGE_METRICS_CUSTOM_RANGE_KEY = "usage_metrics_custom_range".freeze
  REVIEW_APP_DEVELOPERS_ORG_KEY = "review_app_org_key".freeze
  COMPARISON_APP = "comparison_app".freeze
  COMPARATOR_APPS = "comparator_apps".freeze

  serialize :value, JSON

  class << self
    # Returns value for given setting key.
    # @param key [String] Key to return value for.
    # @return [Hash, String, nil] Value if key was found, nil otherwise.
    def [](key)
      find_by(key: key)&.value
    end

    # Creates or updates setting with given key with given value.
    # @param key [String] Key to create/update.
    # @param value [String] Value to set for given key.
    # @return [Boolean] Returns true if record was successfully created/updated, false otherwise.
    def []=(key, value)
      find_or_initialize_by(key: key).update(value: value)
    end

    alias_method :get_value, :[]
    alias_method :set_value, :[]=

    # Sets aggregation period for usage metrics.
    # @param date_from [Time] Beginning of period.
    # @param date_to [Time] End of period.
    def set_usage_metrics_custom_range(date_from, date_to)
      set_value(USAGE_METRICS_CUSTOM_RANGE_KEY, date_from: date_from, date_to: date_to)
    end

    # Returns aggregation period for usage metrics.
    # @return [Hash{String => String}]
    def usage_metrics_custom_range
      self[USAGE_METRICS_CUSTOM_RANGE_KEY] || {
        "date_from" => 1.week.ago.to_s,
        "date_to" => Time.current.to_s,
      }
    end

    # Returns review app developers organization's dxid.
    # Organization will be created if it doesn't exist.
    # @return [String] Organization's dxid.
    def review_app_developers_org
      dxorg = self[REVIEW_APP_DEVELOPERS_ORG_KEY]

      if dxorg.blank?
        dxorg = OrgService::DevelopersOrg.create
        set_value(REVIEW_APP_DEVELOPERS_ORG_KEY, dxorg)
      end

      OrgService::DevelopersOrg.update_members(dxorg)
      dxorg
    end

    # Returns default comparator app.
    # @return [String] Comparison app's dxid.
    def comparison_app
      self[COMPARISON_APP] || DEFAULT_COMPARISON_APP
    end

    def comparator_apps
      Array(self[COMPARATOR_APPS])
    end
  end
end

class Setting < ActiveRecord::Base
  include Auditor

  USAGE_METRICS_CUSTOM_RANGE_KEY = 'usage_metrics_custom_range'.freeze
  REVIEW_APP_DEVELOPERS_ORG_KEY = 'review_app_org_key'.freeze

  serialize :value, JSON

  class << self

    def [](key)
      record = find_by(key: key)
      record.value if record
    end

    def set_value(key, value)
      self.find_or_initialize_by(key: key)
        .update(value: value)
    end

    def set_usage_metrics_custom_range(date_from, date_to)
      set_value(USAGE_METRICS_CUSTOM_RANGE_KEY, date_from: date_from, date_to: date_to)
    end

    def usage_metrics_custom_range
      self[USAGE_METRICS_CUSTOM_RANGE_KEY] || { 'date_from' => 1.week.ago, 'date_to' => Time.zone.now }
    end

    def review_app_developers_org
      dxorg = self[REVIEW_APP_DEVELOPERS_ORG_KEY]

      if dxorg.blank?
        dxorg = OrgService::DevelopersOrg.create
        set_review_app_developers_org(dxorg)
      end

      OrgService::DevelopersOrg.update_members(dxorg)
      dxorg
    end

    def set_review_app_developers_org(dxorg)
      set_value(REVIEW_APP_DEVELOPERS_ORG_KEY, dxorg)
    end

  end
end

module Auditor
  extend ActiveSupport::Concern

  included do
    after_create lambda { auditor_current_action("create") }
    after_update lambda { auditor_current_action("update") }
    after_destroy lambda { auditor_current_action("destroy") }

    after_commit :audit
    after_rollback :reset_current_data
  end

  class << self; attr_accessor :file end

  def self.init!
    unless @file
      @file = File.open("#{Rails.root}/log/audit.log", 'a')
      @file.sync = true

      Auditor.suppress = false
    end
  end

  def self.suppress=(value)
    Thread.current[:auditor_suppress] = value
  end

  def self.suppressed?
    Thread.current[:auditor_suppress]
  end

  def self.current_user=(audit_log_user)
    Thread.current[:auditor_current_user] = audit_log_user
  end

  def self.current_user
    Thread.current[:auditor_current_user]
  end

  def auditor_current_action(action)
    return unless Auditor.current_user
    data = {
      action: action,
      record_type: self.class.to_s,
      record: self.attributes
    }
    Thread.current[:auditor_current_data] = Auditor.auditor_current_data.push(data)
  end

  def self.auditor_current_data
    Thread.current[:auditor_current_data] || []
  end

  def reset_current_data
    Thread.current[:auditor_current_data] = []
  end

  def audit
    return if Auditor.suppressed? or Auditor.current_user.nil?

    Auditor.auditor_current_data.each do |data|
      Auditor.perform_audit(data)
    end

  ensure
    reset_current_data
  end

  def self.perform_audit(data)
    msg = Auditor.prepare_data(data)
    Auditor.init!
    Auditor.file.write("#{msg.to_json},\n")
  end

  def self.prepare_data(action: nil, record: nil, record_type: nil)
    audit_log_user = Auditor.current_user
    {
      timestamp: Time.now.getutc,
      username: audit_log_user.username,
      user_ip: audit_log_user.ip,
      event: action,
      record_type: record_type,
      record: record
    }
  end

  def self.suppress
    Auditor.suppress = true
    yield
  ensure
    Auditor.suppress = false
  end
end

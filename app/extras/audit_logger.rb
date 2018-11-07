# This is a wrapper for a new audit logger with syntax of only "info" method of old audit logger support
# Use Auditor module for any logging inside the app
module AUDIT_LOGGER
  def self.info(msg)
    Auditor.current_user = AuditLogUser.new(nil, nil)
    Auditor.perform_audit({ action: "create", record_type: "Log info", record: { message: msg } })
  end
end

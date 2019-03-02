class AuditLogUser
  attr_reader :username, :ip

  def initialize(username, ip)
    @username = username
    @ip = ip
  end
end

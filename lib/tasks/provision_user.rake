require 'optparse'
require 'pp'

def want_404
  begin
    yield
  rescue Net::HTTPServerException => e
    if e.message =~ /^404/
      return
    end
  end
  raise "API call did not return 404"
end

namespace :provision do
  desc "Provision a user"
  task user: :environment do
    org = {}
    user = {}
    OptionParser.new do |opts|
      opts.banner = "Usage: rake provision:user <options>"
      opts.on("--org-handle illumina") { |v| org[:handle] = v }
      opts.on("--user-first-name George") { |v| user[:first_name] = v }
      opts.on("--user-last-name Asimenos") { |v| user[:last_name] = v }
      opts.on("--user-email george@dnanexus.com") { |v| user[:email] = v }
    end.parse!(ARGV[2..-1])

    [:handle].each do |field|
      raise "Required option --org-#{field} is missing" unless org.has_key?(field)
    end

    [:first_name, :last_name, :email].each do |field|
      raise "Required option --user-#{field.to_s.gsub(/_/, '-')} is missing" unless user.has_key?(field)
    end

    raise "First name must be at least two letters" unless user[:first_name].size >= 2
    raise "Last name must be at least two letters" unless user[:last_name].size >= 2

    user[:dxuser] = User.construct_username(user[:first_name], user[:last_name])   
    raise "The constructed username '#{user[:dxuser]}' is not authserver-compatible" unless User.authserver_acceptable?(user[:dxuser])

    raise "Invalid email" unless User.validate_email(user[:email])
    user[:normalized_email] = user[:email].downcase

    o = Org.find_by(handle: org[:handle])
    raise "This org handle does not exist in rails" unless o.present?
    raise "This user email already exists in rails" if User.find_by(normalized_email: user[:normalized_email])

    api = DNAnexusAPI.new(ADMIN_TOKEN)
    auth = DNAnexusAPI.new(ADMIN_TOKEN, DNANEXUS_AUTHSERVER_URI)

    dxuserid = "user-#{user[:dxuser]}"
    dxorg = Org.construct_dxorg(org[:handle])
    dxorghandle = dxorg.sub(/^org-/, '')

    puts "Checking if #{dxuserid} already exists..."
    want_404 { api.call(dxuserid, 'describe') }

    puts "Final user info:"
    pp user

    puts "Provisioning user (username: #{user[:dxuser]}, final id: #{dxuserid})"
    auth.call("user", "new", {username: user[:dxuser], email: user[:email], first: user[:first_name], last: user[:last_name], billTo: ORG_EVERYONE})
    
    puts "Inviting user #{dxuserid} to org #{dxorg} as a member"
    api.call(dxorg, "invite", {invitee: dxuserid, level: 'MEMBER', allowBillableActivities: true, appAccess: true, projectAccess: 'VIEW', suppressEmailNotification: true})

    puts "Inviting user #{dxuserid} to org #{ORG_EVERYONE} as a member"
    api.call(ORG_EVERYONE, "invite", {invitee: dxuserid, level: 'MEMBER', allowBillableActivities: false, appAccess: true, projectAccess: 'VIEW', suppressEmailNotification: true})

    u = nil
    User.transaction do
      user[:org_id] = o.id
      user[:schema_version] = User::CURRENT_SCHEMA
      user[:open_files_count] = 0
      user[:closing_files_count] = 0
      user[:pending_comparisons_count] = 0
      user[:pending_jobs_count] = 0
      user[:open_assets_count] = 0
      user[:closing_assets_count] = 0
      u = User.create!(user)
    end
    AUDIT_LOGGER.info("A new user has been created under the '#{o.handle}' organization: user=#{u.as_json}")

    # The following is required, otherwise rake continues
    # parsing the command line options and tries to run tasks
    # named after them
    exit 0
  end
end

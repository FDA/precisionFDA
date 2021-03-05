# rubocop:disable Metrics/BlockLength
namespace :orgs do
  # Invite a user to an organization on the platform.
  module OrgInviter
    extend self

    def run(org_name, usernames, token = nil)
      api = token ? DNAnexusAPI.new(token) : DNAnexusAPI.for_admin
      dxorg = org_name[/^org-.+/] || "org-#{org_name}"

      invite_params = {
        level: DNAnexusAPI::ORG_MEMBERSHIP_MEMBER,
        allowBillableActivities: true,
        appAccess: true,
        projectAccess: DNAnexusAPI::PROJECT_ACCESS_CONTRIBUTE,
        suppressEmailNotification: false,
      }

      puts "Invite to #{dxorg} with the following parameters: #{invite_params.to_json}"

      usernames.each do |username|
        dxuser = username[/^user-.*/] || "user-#{username}"

        begin
          api.org_invite(
            dxorg,
            dxuser,
            invite_params,
          )
          puts "Invited #{dxuser}"
          sleep 1
        rescue StandardError => e
          puts "Can't invite #{dxuser} due to an error: #{e.message}"
        end
      end
    end
  end

  desc "Invite users to an organization " \
       "(example: rake orgs:invite[pfda..https,randal.ebert\\,alex.moroz,token])"
  task :invite, %i(org_name usernames token) => :environment do |_, args|
    puts "Provided token is blank, going with admin's token" if args.token.blank?
    abort "Please provide users list to invite" if args.usernames.blank?
    abort "Please provide org name" if args.org_name.blank?

    OrgInviter.run(args.org_name, args.usernames.split(","), args.token)
  end
end
# rubocop:enable Metrics/BlockLength

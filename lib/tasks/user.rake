namespace :user do
  desc "Generate a user"
  task :generate,
    %i(
      dxuser
      first_name
      last_name
      email
      org_handle
      private_files_project
      public_files_project
      private_comparisons_project
      public_comparisons_project
    ) => :environment do |_, args|
    ActiveRecord::Base.transaction do
      user = User.create!(
        dxuser: args.dxuser,
        schema_version: 1,
        first_name: args.first_name,
        last_name: args.last_name,
        email: args.email,
        normalized_email: args.email,
        private_files_project: args.private_files_project,
        public_files_project: args.public_files_project,
        private_comparisons_project: args.private_comparisons_project,
        public_comparisons_project: args.public_comparisons_project,
        has_seen_guidelines: true
      )

      user_org = Org.find_or_create_by!(handle: args.org_handle) do |org|
        org.name = "#{args.last_name}'s org"
        org.admin = user
        org.address = "703 Market"
        org.duns = ""
        org.phone = ""
        org.state = "complete"
        org.singular = false
      end

      user.update!(org: user_org)
    end
  end

  desc "Generate test users"
  task :generate_test_users do
    users = [
      [
        "pfda_autotest1",
        "John",
        "Johnlastname",
        "aabramenko-c+pfda_autotest1@dnanexus.com",
        "autotestorg1",
      ],
      [
        "pfda_autotest2",
        "Bill",
        "Billlastname",
        "aabramenko-c+pfda_autotest2@dnanexus.com",
        "autotestorg2",
      ],
      [
        "precisionfda.admin_dev",
        "PrecisionFDA",
        "Admin - Dev",
        "aabramenko-c+precisionfda.admin_dev@dnanexus.com",
        "pamellaaccounttwo",
      ],
      [
        "mmaltcev3",
        "Mikhail",
        "Maltcev",
        "mmaltcev-c+pfdalocal_user@dnanexus.com",
        "maltcevorg",
      ],
    ].freeze

    users.each do |user|
      Rake::Task["user:generate"].invoke(*user)
      Rake::Task["user:generate"].reenable
    end
  end
end

namespace :user do
  desc "Generate a user"
  task :generate, [:dxuser, :first_name, :last_name, :email, :org_handle, :private_files_project, :public_files_project, :private_comparisons_project, :public_comparisons_project] => :environment do |_, args|
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
      )
      org = Org.find_or_initialize_by(handle: args.org_handle)
      org.attributes = {
        name: "#{args.last_name}'s org",
        admin_id: user.id,
        address: "703 Market",
        duns: "",
        phone: "",
        state: "complete",
        singular: false
      }
      org.save
      user.has_seen_guidelines = true
      user.update!(org_id: org.id)
    end
  end

  desc "Generate test users"
  task :generate_test_users do
    Rake::Task["user:generate"].invoke(
      "pfda_autotest1",
      "John",
      "Johnlastname",
      "aabramenko-c+pfda_autotest1@dnanexus.com",
      "autotestorg1"
    )
    Rake::Task["user:generate"].reenable
    Rake::Task["user:generate"].invoke(
      "pfda_autotest2",
      "Bill",
      "Billlastname",
      "aabramenko-c+pfda_autotest2@dnanexus.com",
      "autotestorg2"
    )
    Rake::Task["user:generate"].reenable
    Rake::Task["user:generate"].invoke(
      "precisionfda.admin_dev",
      "PrecisionFDA",
      "Admin - Dev",
      "aabramenko-c+precisionfda.admin_dev@dnanexus.com",
      "pamellaaccounttwo",
    )
  end
end

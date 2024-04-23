namespace :user do
  def user_attrs
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
      admin_roles
    )
  end

  desc "Generate a user"
  task :generate, user_attrs => :environment do |_, args|
    ActiveRecord::Base.transaction do
      user = User.find_or_create_by!(dxuser: args.dxuser) do |u|
        u.schema_version = 1
        u.first_name = args.first_name
        u.last_name = args.last_name
        u.email = args.email
        u.normalized_email = args.email
        u.private_files_project = args.private_files_project
        u.public_files_project = args.public_files_project
        u.private_comparisons_project = args.private_comparisons_project
        u.public_comparisons_project = args.public_comparisons_project
        u.has_seen_guidelines = true
        u.pricing_map = CloudResourceDefaults::PRICING_MAP
        u.job_limit = CloudResourceDefaults::JOB_LIMIT
        u.total_limit = CloudResourceDefaults::TOTAL_LIMIT
        u.resources = CloudResourceDefaults::RESOURCES
      end

      user.admin_groups = AdminGroup.where(role: args.admin_roles) if args.admin_roles.present?

      user_org = Org.unscoped.find_or_create_by!(handle: args.org_handle) do |org|
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
    file = File.expand_path("users_dev.yml", __dir__)
    users = YAML.load_file(file)

    users.each do |user|
      Rake::Task["user:generate"].invoke(*user.with_indifferent_access.values_at(*user_attrs))
      Rake::Task["user:generate"].reenable
    end
  end
end

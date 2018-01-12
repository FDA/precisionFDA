namespace :user do
  desc "Generate a user"

  task :generate, [:env_prefix] => :environment do |_, args|
    env_prefix = args[:env_prefix].upcase

    first_name = ENV["#{env_prefix}_FIRST_NAME"]
    last_name = ENV["#{env_prefix}_LAST_NAME"]
    email = ENV["#{env_prefix}_EMAIL"]
    dxuser = ENV["#{env_prefix}_DX_USER"]
    org_handle = ENV["#{env_prefix}_ORG_HANDLE"]
    private_files_project = ENV["#{env_prefix}_PRIVATE_FILES_PROJECT"]
    public_files_project = ENV["#{env_prefix}_PUBLIC_FILES_PROJECT"]
    private_comparisons_project = ENV["#{env_prefix}_PRIVATE_COMPARISONS_PROJECT"]
    public_comparisons_project = ENV["#{env_prefix}_PUBLIC_COMPARISONS_PROJECT"]

    ActiveRecord::Base.transaction do
      user = User.create!(
        dxuser: dxuser,
        schema_version: 1,
        first_name: first_name,
        last_name: last_name,
        email: email,
        normalized_email: email,
        private_files_project: private_files_project,
        public_files_project: public_files_project,
        private_comparisons_project: private_comparisons_project,
        public_comparisons_project: public_comparisons_project,
      )

      org = Org.find_or_initialize_by(handle: org_handle)
      org.attributes = {
        name: "#{last_name}'s org",
        admin_id: user.id,
        address: "703 Market",
        duns: "",
        phone: "",
        state: "complete",
        singular: false
      }
      org.save

      user.update!(org_id: org.id)
    end

  end
end

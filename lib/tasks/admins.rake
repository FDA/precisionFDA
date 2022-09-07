namespace :admins do
  desc "Setup admins and admin groups"
  task setup: :environment do
    create_admin_groups!
    load_admins.each { |role, users| create_admin_memberships!(role, users) }
  end
end

def create_admin_groups!
  AdminGroup::ROLES.each { |role| AdminGroup.find_or_create_by!(role: role) }
end

def file_env
  Rails.env.production? ? "prod" : "stage"
end

def load_admins
  YAML.load_file(File.expand_path("admins_#{file_env}.yml", __dir__))
end

def create_admin_memberships!(role, users)
  admin_group = AdminGroup.find_or_create_by!(role: role)

  User.where(dxuser: users).find_each do |user|
    user.admin_groups = user.admin_groups | [admin_group]
    user.save!
  end
end

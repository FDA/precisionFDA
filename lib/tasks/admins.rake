namespace :admins do
  desc "Setup admins and admin groups"
  task setup: :environment do
    create_admin_memberships AdminGroup::ROLE_REVIEW_SPACE_ADMIN, REVIEW_SPACE_ADMINS
    create_admin_memberships AdminGroup::ROLE_SITE_ADMIN, User::SITE_ADMINS
    create_admin_memberships AdminGroup::ROLE_CHALLENGE_ADMIN, User::CHALLENGE_ADMINS
    create_admin_memberships AdminGroup::ROLE_CHALLENGE_EVALUATOR, User::CHALLENGE_EVALUATORS
  end
end

def create_admin_memberships(group, users)
  admin_group = AdminGroup.find_or_create_by!(role: group)

  User.where(dxuser: users).find_each do |user|
    user.admin_groups = user.admin_groups | [admin_group]
    user.save!
  end
end

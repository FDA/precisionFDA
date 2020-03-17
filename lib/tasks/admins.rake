namespace :admins do
  desc "Setup admins and admin groups"
  task setup: :environment do
    create_admin_memberships "space", REVIEW_SPACE_ADMINS
    create_admin_memberships "site", User::SITE_ADMINS
    create_admin_memberships "challenge_admin", User::CHALLENGE_ADMINS
    create_admin_memberships "challenge_eval", User::CHALLENGE_EVALUATORS
  end
end

def create_admin_memberships(group, users)
  admin_group = AdminGroup.create!(role: group)
  users.each do |dxuser|
    user = User.find_by(dxuser: dxuser)
    AdminMembership.create(user_id: user.id, admin_group_id: admin_group.id) if user
  end
end

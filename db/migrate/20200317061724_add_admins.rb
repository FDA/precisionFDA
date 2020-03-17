class AddAdmins < ActiveRecord::Migration[5.2]
  def up
    create_admin_memberships 'space', REVIEW_SPACE_ADMINS
    create_admin_memberships 'site', User::SITE_ADMINS
    create_admin_memberships 'challenge_admin', User::CHALLENGE_ADMINS
    create_admin_memberships 'challenge_eval', User::CHALLENGE_EVALUATORS
  end

  def down
    destroy_admin_memberships 'space', REVIEW_SPACE_ADMINS
    destroy_admin_memberships 'site', User::SITE_ADMINS
    destroy_admin_memberships 'challenge_admin', User::CHALLENGE_ADMINS
    destroy_admin_memberships 'challenge_eval', User::CHALLENGE_EVALUATORS
  end

  def create_admin_memberships(group, users)
    admin_group = AdminGroup.create!(role: group)
    users.each do |dxuser|
      user = User.find_by(dxuser: dxuser)
      AdminMembership.create(user_id: user.id, admin_group_id: admin_group.id) if user
    end
  end

  def destroy_admin_memberships(group, users)
    admin_group = AdminGroup.find_by(role: group)
    users.each do |dxuser|
      user = User.find_by(dxuser: dxuser)
      AdminMembership.find_by(user_id: user.id, admin_group_id: admin_group.id).destroy if user
    end
    admin_group.destroy
  end
end

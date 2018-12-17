class SpaceMembershipMigrateRolesAndSides < ActiveRecord::Migration
  def change
    add_column :space_memberships, :active, :boolean, default: true

    rename_column :space_memberships, :role, :old_role
    add_column :space_memberships, :role, :int, default: 0, null: false

    rename_column :space_memberships, :side, :old_side
    add_column :space_memberships, :side, :int, default: 0, null: false

    reversible do |dir|
      dir.up do
        SpaceMembership.reset_column_information
        update_sides
        update_roles
      end
    end

    remove_column :space_memberships, :old_role
    remove_column :space_memberships, :old_side
  end

  def update_sides
    SpaceMembership.find_each do |member|
      member.update(side: member.old_side == 'HOST' ? 0 : 1)
    end
  end

  def update_roles
    Space.find_each do |space|
      update_members_roles(space.space_memberships.guest)
      update_members_roles(space.space_memberships.host)
    end
  end

  def update_members_roles(members)
    members.each_with_index do |member, index|
      if index == 0
        member.lead!
        next
      end

      member.old_role == 'ADMIN' ? member.admin! : member.member!
    end
  end
end

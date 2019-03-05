class AddOrganizationAdminToInvitations < ActiveRecord::Migration
  def change
    add_column :invitations,
               :organization_admin,
               :boolean,
               default: false,
               null: false
  end
end

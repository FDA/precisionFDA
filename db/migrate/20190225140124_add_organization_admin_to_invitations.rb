class AddOrganizationAdminToInvitations < ActiveRecord::Migration[4.2]
  def change
    add_column :invitations,
               :organization_admin,
               :boolean,
               default: false,
               null: false
  end
end

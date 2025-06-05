class AddProvisioningStateToInvitations < ActiveRecord::Migration[6.1]
  def up
    add_column :invitations, :provisioning_state, :string, default: "pending"

    execute <<-SQL.squish
      UPDATE invitations
      SET provisioning_state = "finished"
      WHERE user_id IS NOT NULL
    SQL
  end

  def down
    remove_column :invitations, :provisioning_state, :string
  end
end

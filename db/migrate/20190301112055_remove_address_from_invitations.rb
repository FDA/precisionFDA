class RemoveAddressFromInvitations < ActiveRecord::Migration[4.2]
  def change
    remove_column :invitations, :address, :string
  end
end

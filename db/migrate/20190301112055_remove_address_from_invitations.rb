class RemoveAddressFromInvitations < ActiveRecord::Migration
  def change
    remove_column :invitations, :address, :string
  end
end

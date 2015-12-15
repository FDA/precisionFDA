class AddUserStateAndCodeToInvitation < ActiveRecord::Migration
  def change
    add_reference :invitations, :user, index: true, foreign_key: true
    add_column :invitations, :state, :string
    add_index :invitations, :state
    add_index :invitations, :email
    add_column :invitations, :code, :string
    add_index :invitations, :code, unique: true
  end
end

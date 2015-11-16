class AddExtrasToInvitation < ActiveRecord::Migration
  def change
    add_column :invitations, :extras, :text
  end
end

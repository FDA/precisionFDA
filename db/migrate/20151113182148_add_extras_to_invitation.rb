class AddExtrasToInvitation < ActiveRecord::Migration[4.2]
  def change
    add_column :invitations, :extras, :text
  end
end

class AddVerifiedFlagToSpaces < ActiveRecord::Migration[4.2]
  def change
    add_column :spaces, :verified, :boolean, default: false, null: false
  end
end

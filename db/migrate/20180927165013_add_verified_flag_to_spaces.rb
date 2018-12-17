class AddVerifiedFlagToSpaces < ActiveRecord::Migration
  def change
    add_column :spaces, :verified, :boolean, default: false, null: false
  end
end

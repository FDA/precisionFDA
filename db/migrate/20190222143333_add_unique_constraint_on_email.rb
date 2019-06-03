class AddUniqueConstraintOnEmail < ActiveRecord::Migration
  def change
    add_index :profiles, :email, unique: true
  end
end

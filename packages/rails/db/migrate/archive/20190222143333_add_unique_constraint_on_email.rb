class AddUniqueConstraintOnEmail < ActiveRecord::Migration[4.2]
  def change
    add_index :profiles, :email, unique: true
  end
end

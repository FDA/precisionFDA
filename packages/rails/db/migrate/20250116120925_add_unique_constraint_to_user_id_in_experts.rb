class AddUniqueConstraintToUserIdInExperts < ActiveRecord::Migration[6.1]
  def change
    remove_foreign_key :experts, :users

    remove_index :experts, :user_id if index_exists?(:experts, :user_id)

    add_index :experts, :user_id, unique: true

    add_foreign_key :experts, :users
  end
end

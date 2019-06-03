class AddUserStateToUsers < ActiveRecord::Migration
  def change
    add_column :users, :user_state, :integer, default: 0, null: false
  end
end

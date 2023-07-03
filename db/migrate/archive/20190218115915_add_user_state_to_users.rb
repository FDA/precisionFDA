class AddUserStateToUsers < ActiveRecord::Migration[4.2]
  def change
    add_column :users, :user_state, :integer, default: 0, null: false
  end
end

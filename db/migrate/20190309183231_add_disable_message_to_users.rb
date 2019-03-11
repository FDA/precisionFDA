class AddDisableMessageToUsers < ActiveRecord::Migration
  def change
    add_column :users, :disable_message, :string
  end
end

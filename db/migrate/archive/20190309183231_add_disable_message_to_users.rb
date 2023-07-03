class AddDisableMessageToUsers < ActiveRecord::Migration[4.2]
  def change
    add_column :users, :disable_message, :string
  end
end

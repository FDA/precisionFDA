class AddExtrasToUser < ActiveRecord::Migration[4.2]
  def change
    add_column :users, :first_name, :string
    add_column :users, :last_name, :string
    add_column :users, :email, :string
    add_column :users, :normalized_email, :string
    add_column :users, :last_login, :datetime
    add_index :users, :normalized_email
  end
end

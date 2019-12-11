class AddRealExtrasToUser < ActiveRecord::Migration[4.2]
  def change
    add_column :users, :extras, :text
  end
end

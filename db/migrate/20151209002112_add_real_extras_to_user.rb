class AddRealExtrasToUser < ActiveRecord::Migration
  def change
    add_column :users, :extras, :text
  end
end

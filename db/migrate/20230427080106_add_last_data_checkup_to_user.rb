class AddLastDataCheckupToUser < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :last_data_checkup, :datetime
  end
end

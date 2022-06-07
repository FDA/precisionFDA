class AddDataToEvents < ActiveRecord::Migration[6.1]
  def change
    add_column :events, :data, :text
  end
end

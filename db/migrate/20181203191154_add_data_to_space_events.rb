class AddDataToSpaceEvents < ActiveRecord::Migration[4.2]
  def change
    add_column :space_events, :data, :text
  end
end

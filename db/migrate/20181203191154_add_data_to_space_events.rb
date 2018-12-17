class AddDataToSpaceEvents < ActiveRecord::Migration
  def change
    add_column :space_events, :data, :text
  end
end

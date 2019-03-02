class AddObjectTypeToSpaceEvents < ActiveRecord::Migration
  def change
    add_column :space_events, :object_type, :integer, null: false
    add_column :space_events, :role, :integer, null: false
  end
end

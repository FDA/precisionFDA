class AddObjectTypeToSpaceEvents < ActiveRecord::Migration[4.2]
  def change
    add_column :space_events, :object_type, :integer, null: false
    add_column :space_events, :role, :integer, null: false
  end
end

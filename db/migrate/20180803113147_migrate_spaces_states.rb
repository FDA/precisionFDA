class MigrateSpacesStates < ActiveRecord::Migration
  def change
    rename_column :spaces, :state, :old_state
    add_column :spaces, :state, :int, default: 0, null: false

    rename_column :spaces, :space_type, :old_space_type
    add_column :spaces, :space_type, :int, default: 0, null: false

    Space.find_each do |space|
      space.update(
        state: space.old_state == 'ACTIVE' ? 1 : 0,
        space_type: 0
      )
    end

    remove_column :spaces, :old_state
    remove_column :spaces, :old_space_type
  end
end

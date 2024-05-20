class AddIndexToNodes < ActiveRecord::Migration[6.1]
  def change
    add_index :nodes, %i(dxid sti_type)
  end
end

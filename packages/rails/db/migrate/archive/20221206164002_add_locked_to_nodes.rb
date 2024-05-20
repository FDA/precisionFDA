class AddLockedToNodes < ActiveRecord::Migration[6.1]
  def change
    add_column :nodes, :locked, :boolean, default: false
  end
end

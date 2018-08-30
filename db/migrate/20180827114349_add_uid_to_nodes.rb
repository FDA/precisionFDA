class AddUidToNodes < ActiveRecord::Migration
  def change
    add_column :nodes, :uid, :string

    reversible do |dir|
      dir.up do
        execute "UPDATE `nodes` SET uid=CONCAT(dxid, '-1')"
      end
    end

    add_index :nodes, :uid, unique: true

  end
end

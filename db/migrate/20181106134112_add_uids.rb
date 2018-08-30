class AddUids < ActiveRecord::Migration
  def change
    add_column :jobs, :uid, :string
    add_column :apps, :uid, :string

    reversible do |dir|
      dir.up do
        execute "UPDATE `jobs` SET uid=CONCAT(dxid, '-1')"
        execute "UPDATE `apps` SET uid=CONCAT(dxid, '-1')"
      end
    end

    add_index :jobs, :uid, unique: true
    add_index :apps, :uid, unique: true
  end
end

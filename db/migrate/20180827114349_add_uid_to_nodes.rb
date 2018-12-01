class AddUidToNodes < ActiveRecord::Migration
  def change
    add_column :nodes, :uid, :string

    reversible do |dir|
      dir.up do
        execute "UPDATE `nodes` SET uid=CONCAT(dxid, '-1')"
        fix_duplicates
      end
    end

    add_index :nodes, :uid, unique: true

  end

  def fix_duplicates
    ids = UserFile.group(:dxid).having("count(*) > 1").map(&:dxid)
    ids.each do |dxid|
      UserFile.where(dxid: dxid).order(:id).each_with_index do |file, index|
        next if index == 0

        file.update(uid: "#{file.dxid}-#{index + 1}")
      end
    end
  end
end

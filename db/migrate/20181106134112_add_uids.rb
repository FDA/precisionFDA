class AddUids < ActiveRecord::Migration
  def change
    add_column :jobs, :uid, :string
    add_column :apps, :uid, :string

    reversible do |dir|
      dir.up do
        execute "UPDATE `jobs` SET uid=CONCAT(dxid, '-1')"
        execute "UPDATE `apps` SET uid=CONCAT(dxid, '-1')"
        fix_duplicates(App)
        fix_duplicates(Job)
      end
    end

    add_index :jobs, :uid, unique: true
    add_index :apps, :uid, unique: true
  end

  def fix_duplicates(klass)
    ids = klass.group(:dxid).having("count(*) > 1").map(&:dxid)
    ids.each do |dxid|
      klass.where(dxid: dxid).order(:id).each_with_index do |file, index|
        next if index == 0

        file.update(uid: "#{file.dxid}-#{index + 1}")
      end
    end
  end

end

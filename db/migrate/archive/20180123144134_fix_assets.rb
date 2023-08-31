class FixAssets < ActiveRecord::Migration[4.2]
  def change
    reversible do |dir|
      dir.up do
        execute <<-SQL
          UPDATE nodes SET sti_type = 'Asset' WHERE sti_type = 'UserFile' AND parent_type = 'Asset';
        SQL
      end
    end
  end
end

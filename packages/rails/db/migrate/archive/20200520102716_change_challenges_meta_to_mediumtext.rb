class ChangeChallengesMetaToMediumtext < ActiveRecord::Migration[5.2]
  def change
    reversible do |dir|
      dir.up do
        change_column :challenges, :meta, :mediumtext
      end

      dir.down do
        change_column :challenges, :meta, :text
      end
    end
  end
end

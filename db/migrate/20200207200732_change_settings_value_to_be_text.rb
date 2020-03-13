class ChangeSettingsValueToBeText < ActiveRecord::Migration[5.2]
  def change
    reversible do |dir|
      dir.up do
        change_column :settings, :value, :text, null: false
      end

      dir.down do
        change_column :settings, :value, :string, null: false
      end
    end
  end
end

class AddOsReleaseToAppSeries < ActiveRecord::Migration[5.2]
  def change
    add_column :apps, :release, :string

    reversible do |dir|
      dir.up do
        ActiveRecord::Base.connection.execute "UPDATE `apps` SET `release` = '14.04'"
      end
    end

    change_column_null :apps, :release, false
  end
end

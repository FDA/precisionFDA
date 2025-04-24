class AddSnapshotToAppSeries < ActiveRecord::Migration[6.1]
  def up
    add_column :app_series, :snapshot, :boolean, default: false

    execute <<-SQL.squish
      UPDATE app_series
      SET snapshot = true
      WHERE name in ('pfda-ttyd', 'guacamole', 'pfda-jupyterLab')
    SQL
  end

  def down
    remove_column :app_series, :snapshot, :boolean
  end
end

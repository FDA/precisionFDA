class CreateAppSeries < ActiveRecord::Migration[4.2]
  def change
    create_table :app_series do |t|
      t.string :dxid
      t.string :name
      t.references :latest_revision_app, index: true
      t.references :latest_version_app, index: true
      t.references :user, index: true, foreign_key: true
      t.string :scope

      t.timestamps null: false
    end
    add_index :app_series, :scope
    add_index :app_series, :dxid
    add_foreign_key :app_series, :apps, column: 'latest_revision_app_id'
    add_foreign_key :app_series, :apps, column: 'latest_version_app_id'
    add_reference :apps, :app_series, index: true, foreign_key: true
    add_reference :jobs, :app_series, index: true, foreign_key: true
  end
end

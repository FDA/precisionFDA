class AddDeletedToAppsAndWorkflows < ActiveRecord::Migration[6.0]
  def change
    add_column :workflows, :deleted, :boolean, null: false, default: false
    add_column :workflow_series, :deleted, :boolean, null: false, default: false
    add_column :apps, :deleted, :boolean, null: false, default: false
    add_column :app_series, :deleted, :boolean, null: false, default: false

    add_index :workflows, :deleted
    add_index :workflow_series, :deleted
    add_index :apps, :deleted
    add_index :app_series, :deleted
  end
end

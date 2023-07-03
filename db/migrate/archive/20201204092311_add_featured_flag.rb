class AddFeaturedFlag < ActiveRecord::Migration[6.0]
  def change
    add_column :workflows, :featured, :boolean, default: false
    add_column :workflow_series, :featured, :boolean, default: false
    add_column :apps, :featured, :boolean, default: false
    add_column :app_series, :featured, :boolean, default: false
    add_column :nodes, :featured, :boolean, default: false
    add_column :jobs, :featured, :boolean, default: false
  end
end

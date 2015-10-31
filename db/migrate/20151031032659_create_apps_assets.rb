class CreateAppsAssets < ActiveRecord::Migration
  def change
    create_table :apps_assets do |t|
      t.belongs_to :app, index: true, foreign_key: true
      t.belongs_to :asset, index: true
    end

    add_foreign_key :apps_assets, :user_files, column: 'asset_id'
  end
end

class RemoveAssetCountsFromUser < ActiveRecord::Migration[4.2]
  def change
    remove_column :users, :open_assets_count, :int
    remove_column :users, :closing_assets_count, :int
  end
end

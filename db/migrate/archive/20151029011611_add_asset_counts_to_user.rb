class AddAssetCountsToUser < ActiveRecord::Migration[4.2]
  def change
    add_column :users, :open_assets_count, :int
    add_column :users, :closing_assets_count, :int

    User.find_each { |u| u.update!(:open_assets_count => 0) if u.open_assets_count.nil? }
    User.find_each { |u| u.update!(:closing_assets_count => 0) if u.closing_assets_count.nil? }
  end
end

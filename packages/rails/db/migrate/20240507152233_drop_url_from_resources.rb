class DropUrlFromResources < ActiveRecord::Migration[6.1]
  def up
    remove_column :resources, :url
  end
end

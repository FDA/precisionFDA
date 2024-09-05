class AddIsPublicationNews < ActiveRecord::Migration[6.1]
  def change
    add_column :news_items, :is_publication, :boolean, default: false
  end
end

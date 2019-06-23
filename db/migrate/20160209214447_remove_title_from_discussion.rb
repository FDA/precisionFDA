class RemoveTitleFromDiscussion < ActiveRecord::Migration[4.2]
  def change
    remove_column :discussions, :title, :string
  end
end

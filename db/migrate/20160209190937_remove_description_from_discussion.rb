class RemoveDescriptionFromDiscussion < ActiveRecord::Migration[4.2]
  def change
    remove_column :discussions, :description, :text
  end
end

class RemoveDescriptionFromDiscussion < ActiveRecord::Migration
  def change
    remove_column :discussions, :description, :text
  end
end

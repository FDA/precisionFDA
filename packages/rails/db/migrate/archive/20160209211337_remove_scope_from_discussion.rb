class RemoveScopeFromDiscussion < ActiveRecord::Migration[4.2]
  def change
    remove_column :discussions, :scope, :string
  end
end

class RemoveScopeFromDiscussion < ActiveRecord::Migration
  def change
    remove_column :discussions, :scope, :string
  end
end

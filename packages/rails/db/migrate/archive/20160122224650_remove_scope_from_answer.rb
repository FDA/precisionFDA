class RemoveScopeFromAnswer < ActiveRecord::Migration[4.2]
  def change
    remove_column :answers, :scope, :string
  end
end

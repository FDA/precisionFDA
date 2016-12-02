class RemoveScopeFromAnswer < ActiveRecord::Migration
  def change
    remove_column :answers, :scope, :string
  end
end

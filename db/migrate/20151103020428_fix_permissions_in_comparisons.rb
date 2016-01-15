class FixPermissionsInComparisons < ActiveRecord::Migration
  def change
    add_column :comparisons, :scope, :string
    add_index :comparisons, :scope

    Comparison.find_each do |item|
      if item.scope.nil?
        item.update!(scope: item.public ? "public" : "private" )
      end
    end

    remove_column :comparisons, :public, :boolean
  end
end

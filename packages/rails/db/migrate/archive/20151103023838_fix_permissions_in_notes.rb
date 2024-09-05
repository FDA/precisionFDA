class FixPermissionsInNotes < ActiveRecord::Migration[4.2]
  def change
    add_column :notes, :scope, :string
    add_index :notes, :scope

    Note.find_each do |item|
      if item.scope.nil?
        item.update!(scope: item.public ? "public" : "private" )
      end
    end

    remove_column :notes, :public, :boolean
  end
end

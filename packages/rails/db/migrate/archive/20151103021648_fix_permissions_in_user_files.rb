class FixPermissionsInUserFiles < ActiveRecord::Migration[4.2]
  def change
    add_column :user_files, :scope, :string
    add_index :user_files, :scope

    UserFile.find_each do |item|
      if item.scope.nil?
        item.update!(scope: item.public ? "public" : "private" )
      end
    end

    remove_column :user_files, :public, :boolean
  end
end

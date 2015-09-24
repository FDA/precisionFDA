class AddParentToUserFile < ActiveRecord::Migration
  def change
    add_reference :user_files, :parent, index: true, polymorphic: true
  end
end

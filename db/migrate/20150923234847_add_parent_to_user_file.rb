class AddParentToUserFile < ActiveRecord::Migration
  def change
    add_reference :user_files, :parent, index: true, polymorphic: true

    UserFile.unscoped.select { |u| u.parent.nil? }.each { |u| u.update!(parent: User.find(u.user_id) ) }
  end
end

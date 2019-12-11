class AddParentToUserFile < ActiveRecord::Migration[4.2]
  def change
    add_reference :user_files, :parent, index: true, polymorphic: true

    UserFile.real_files.select { |u| u.parent.nil? }.each { |u| u.update!(parent: User.find(u.user_id) ) }
  end
end

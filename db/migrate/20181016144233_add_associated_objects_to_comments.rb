class AddAssociatedObjectsToComments < ActiveRecord::Migration[4.2]
  def change
    change_table :comments do |t|
      t.references :content_object, polymorphic: true, index: true
    end
  end
end

class AddProtectedToSpaces < ActiveRecord::Migration[6.1]
  def change
    add_column :spaces, :protected, :boolean, default: false
  end
end

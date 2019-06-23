class AddTitleToLicenses < ActiveRecord::Migration[4.2]
  def change
    add_column :licenses, :title, :string, required: true
  end
end

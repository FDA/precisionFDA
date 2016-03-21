class AddTitleToLicenses < ActiveRecord::Migration
  def change
    add_column :licenses, :title, :string, required: true
  end
end

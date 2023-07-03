class AddPrivateFieldToSpaceTemplates < ActiveRecord::Migration[4.2]
  def change
    add_column :space_templates, :private, :boolean, default: false, null: false
  end
end

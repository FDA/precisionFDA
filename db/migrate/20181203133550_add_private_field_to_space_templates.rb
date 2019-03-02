class AddPrivateFieldToSpaceTemplates < ActiveRecord::Migration
  def change
    add_column :space_templates, :private, :boolean, default: false, null: false
  end
end

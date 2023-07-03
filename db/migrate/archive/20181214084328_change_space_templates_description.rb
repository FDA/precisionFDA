class ChangeSpaceTemplatesDescription < ActiveRecord::Migration[4.2]
  def change
    change_column :space_templates, :description, :text
  end
end

class ChangeSpaceTemplatesDescription < ActiveRecord::Migration
  def change
    change_column :space_templates, :description, :text
  end
end

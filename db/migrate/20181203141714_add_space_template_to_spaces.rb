class AddSpaceTemplateToSpaces < ActiveRecord::Migration
  def change
    add_column :spaces, :space_template_id, :integer
  end
end

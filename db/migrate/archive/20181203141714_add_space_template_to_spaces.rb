class AddSpaceTemplateToSpaces < ActiveRecord::Migration[4.2]
  def change
    add_column :spaces, :space_template_id, :integer
  end
end

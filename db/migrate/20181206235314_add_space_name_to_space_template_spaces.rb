class AddSpaceNameToSpaceTemplateSpaces < ActiveRecord::Migration
  def change
    add_column :space_template_spaces, :space_name, :string
  end
end

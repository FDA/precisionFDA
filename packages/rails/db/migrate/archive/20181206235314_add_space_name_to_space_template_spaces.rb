class AddSpaceNameToSpaceTemplateSpaces < ActiveRecord::Migration[4.2]
  def change
    add_column :space_template_spaces, :space_name, :string
  end
end

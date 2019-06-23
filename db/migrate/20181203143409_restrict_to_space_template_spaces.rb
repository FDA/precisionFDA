class RestrictToSpaceTemplateSpaces < ActiveRecord::Migration[4.2]
  def change
    add_column :spaces, :restrict_to_template, :boolean, default: false
  end
end

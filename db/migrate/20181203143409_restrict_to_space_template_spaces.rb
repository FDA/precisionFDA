class RestrictToSpaceTemplateSpaces < ActiveRecord::Migration
  def change
    add_column :spaces, :restrict_to_template, :boolean, default: false
  end
end

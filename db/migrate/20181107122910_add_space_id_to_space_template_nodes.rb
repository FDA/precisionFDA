class AddSpaceIdToSpaceTemplateNodes < ActiveRecord::Migration
  def change
    add_column :space_template_nodes, :space_id, :string
  end
end

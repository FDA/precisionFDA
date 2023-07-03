class AddSpaceIdToSpaceTemplateNodes < ActiveRecord::Migration[4.2]
  def change
    add_column :space_template_nodes, :space_id, :string
  end
end

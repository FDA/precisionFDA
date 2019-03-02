class AddNodeNameToSpaceTemplateNodes < ActiveRecord::Migration
  def change
    add_column :space_template_nodes, :node_name, :string
  end
end

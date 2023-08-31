class AddUserIdToSpaceTemplates < ActiveRecord::Migration[4.2]
  def change
    add_column :space_templates, :user_id, :integer
  end
end

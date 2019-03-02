class AddUserIdToSpaceTemplates < ActiveRecord::Migration
  def change
    add_column :space_templates, :user_id, :integer
  end
end

class RemoveRestrictToTemplateAndVerifiedFromSpaces < ActiveRecord::Migration[6.1]
  def change
    remove_column :spaces, :restrict_to_template
    remove_column :spaces, :verified
  end
end

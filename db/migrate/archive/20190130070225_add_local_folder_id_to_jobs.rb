class AddLocalFolderIdToJobs < ActiveRecord::Migration[4.2]
  def change
    add_column :jobs, :local_folder_id, :integer
  end
end

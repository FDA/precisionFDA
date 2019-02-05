class AddLocalFolderIdToJobs < ActiveRecord::Migration
  def change
    add_column :jobs, :local_folder_id, :integer
  end
end

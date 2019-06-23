class RemoveOpenFilesCountFromUser < ActiveRecord::Migration[4.2]
  def change
    remove_column :users, :open_files_count, :int
  end
end

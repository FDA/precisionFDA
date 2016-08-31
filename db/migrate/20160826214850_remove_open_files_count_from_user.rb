class RemoveOpenFilesCountFromUser < ActiveRecord::Migration
  def change
    remove_column :users, :open_files_count, :int
  end
end

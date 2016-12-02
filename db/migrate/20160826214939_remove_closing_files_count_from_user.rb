class RemoveClosingFilesCountFromUser < ActiveRecord::Migration
  def change
    remove_column :users, :closing_files_count, :int
  end
end

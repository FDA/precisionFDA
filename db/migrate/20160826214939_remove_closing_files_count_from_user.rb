class RemoveClosingFilesCountFromUser < ActiveRecord::Migration[4.2]
  def change
    remove_column :users, :closing_files_count, :int
  end
end

class RemoveContentFromAnswer < ActiveRecord::Migration
  def change
    remove_column :answers, :content, :string
  end
end

class RemoveContentFromAnswer < ActiveRecord::Migration[4.2]
  def change
    remove_column :answers, :content, :string
  end
end

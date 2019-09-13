class AddBatchToAnalyses < ActiveRecord::Migration[4.2]
  def change
    add_column :analyses, :batch_id, :string
  end
end

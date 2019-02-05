class AddBatchToAnalyses < ActiveRecord::Migration
  def change
    add_column :analyses, :batch_id, :string
  end
end

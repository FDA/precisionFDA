class RemovePendingComparisonsCountFromUser < ActiveRecord::Migration
  def change
    remove_column :users, :pending_comparisons_count, :int
  end
end

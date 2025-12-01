class AddFailureReasonToDbClusters < ActiveRecord::Migration[6.1]
  def change
    add_column :dbclusters, :failure_reason, :string
  end
end

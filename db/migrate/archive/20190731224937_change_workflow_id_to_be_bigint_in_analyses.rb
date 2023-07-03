class ChangeWorkflowIdToBeBigintInAnalyses < ActiveRecord::Migration[5.2]
  def change
    def up
      change_column :analyses, :workflow_id, :bigint
    end

    def down
      change_column :analyses, :workflow_id, :integer
    end
  end
end

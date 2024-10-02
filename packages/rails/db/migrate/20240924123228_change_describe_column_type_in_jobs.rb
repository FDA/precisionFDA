class ChangeDescribeColumnTypeInJobs < ActiveRecord::Migration[6.1]
  def up
    change_column :jobs, :describe, :mediumtext
  end

  def down
    change_column :jobs, :describe, :text
  end
end

class AddResponseTimeToTasks < ActiveRecord::Migration
  def change
    add_column :tasks, :response_time, :datetime
    add_column :tasks, :complete_time, :datetime
  end
end

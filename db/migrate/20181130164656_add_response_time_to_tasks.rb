class AddResponseTimeToTasks < ActiveRecord::Migration[4.2]
  def change
    add_column :tasks, :response_time, :datetime
    add_column :tasks, :complete_time, :datetime
  end
end

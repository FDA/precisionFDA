class AddScopeToJobs < ActiveRecord::Migration[4.2]
  def change
    add_column :jobs, :scope, :string
    add_index :jobs, :scope

    Job.find_each do |item|
      if item.scope.nil?
        item.update!(scope: "private")
      end
    end
  end
end

class AddScopeToJobs < ActiveRecord::Migration
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

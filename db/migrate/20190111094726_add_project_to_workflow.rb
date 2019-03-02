class AddProjectToWorkflow < ActiveRecord::Migration
  def change
    add_column :workflows, :project, :string

    reversible do |dir|
      dir.up { copy_users_project_to_workflow }
    end
  end

  def copy_users_project_to_workflow
    User.find_each do |user|
      user.workflows.update_all(project: user.private_files_project)
    end
  end
end

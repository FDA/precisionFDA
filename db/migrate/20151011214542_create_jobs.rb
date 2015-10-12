class CreateJobs < ActiveRecord::Migration
  def change
    create_table :jobs do |t|
      t.string :dxid
      t.string :series
      t.references :app, index: true, foreign_key: true
      t.string :project
      t.text :spec
      t.text :run_data
      t.text :describe
      t.text :provenance
      t.text :app_meta
      t.string :state
      t.string :name
      t.references :user, index: true, foreign_key: true

      t.timestamps null: false
    end
    add_index :jobs, :dxid
    add_index :jobs, :series

    create_table :job_inputs do |t|
      t.belongs_to :job, index: true
      t.belongs_to :user_file, index: true
    end
  end
end

class CreateComparisons < ActiveRecord::Migration
  def change
    create_table :comparisons do |t|
      t.string :name, required: true
      t.text :description
      t.belongs_to :user, index: true, foreign_key: true, required: true
      t.boolean :public, required: true
      t.string :state, required: true
      t.string :dxjobid, required: true
      t.string :project, required: true
      t.text :meta

      t.timestamps null: false
    end

    add_index :comparisons, :public
    add_index :comparisons, :state

    create_table :comparison_inputs do |t|
      t.belongs_to :comparison, index: true
      t.belongs_to :user_file, index: true
      t.string :role, required: true
    end

  end
end

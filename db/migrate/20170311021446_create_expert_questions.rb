class CreateExpertQuestions < ActiveRecord::Migration
  def change
    create_table :expert_questions do |t|
      t.references :expert, index: true, foreign_key: true
      t.text   :body
      t.string :state, index: true

      t.timestamps null: false
    end
  end
end

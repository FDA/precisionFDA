class CreateAnswers < ActiveRecord::Migration
  def change
    create_table :answers do |t|
      t.references :user, index: true, foreign_key: true
      t.references :discussion, index: true, foreign_key: true
      t.string :content
      t.string :scope

      t.timestamps null: false
    end
  end
end

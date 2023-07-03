class CreateSubmissions < ActiveRecord::Migration[4.2]
  def change
    create_table :submissions do |t|
      t.references :challenge, index: true, foreign_key: true
      t.references :user, index: true, foreign_key: true
      t.references :job, index: true, foreign_key: true
      t.text :desc
      t.text :meta

      t.timestamps null: false
    end
  end
end

class CreateChallengeResources < ActiveRecord::Migration
  def change
    create_table :challenge_resources do |t|
      t.references :challenge, index: true, foreign_key: true
      t.references :user_file, index: true, foreign_key: true
      t.references :user, index: true, foreign_key: true
      t.text	:url
      t.text :meta

      t.timestamps null: false
    end
  end
end

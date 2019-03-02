class CreateGetStartedBoxesTable < ActiveRecord::Migration
  def change
    create_table :get_started_boxes do |t|
      t.string :title
      t.string :feature_url
      t.string :documentation_url
      t.text :description
      t.boolean :public
      t.integer :kind, default: 0
      t.integer :position, default: 0

      t.timestamps null: false
    end
  end
end

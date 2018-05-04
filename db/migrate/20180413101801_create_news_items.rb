class CreateNewsItems < ActiveRecord::Migration
  def change
    create_table :news_items do |t|
      t.string :title
      t.string :link
      t.date :when
      t.text :content
      t.integer :user_id
      t.string :video
      t.integer :position, default: 0, null: false
      t.boolean :published

      t.timestamps null: false
    end

    add_index "news_items", ["position"], name: "position_news_items_idx", using: :btree


  end
end

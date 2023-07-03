class IndexVersionOnApps < ActiveRecord::Migration[4.2]
  def change
    add_index :apps, :version
  end
end

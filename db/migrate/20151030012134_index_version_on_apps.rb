class IndexVersionOnApps < ActiveRecord::Migration
  def change
    add_index :apps, :version
  end
end

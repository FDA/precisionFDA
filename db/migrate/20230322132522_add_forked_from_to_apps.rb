class AddForkedFromToApps < ActiveRecord::Migration[6.1]
  def change
    add_column :apps, :forked_from, :string
  end
end

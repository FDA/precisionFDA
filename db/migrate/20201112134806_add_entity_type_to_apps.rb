class AddEntityTypeToApps < ActiveRecord::Migration[6.0]
  def change
    add_column :apps, :entity_type, :integer,
               null: false, default: App.entity_types[App::TYPE_REGULAR]
  end
end

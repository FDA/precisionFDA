class AddSlugToDataPortals < ActiveRecord::Migration[6.1]
  def up
    add_column :data_portals, :url_slug, :string

    # Generate url_slug from name:
    # 1) Keep only english alphabet characters, digits, dashes and spaces
    # 2) Make it lowercase
    # 3) Replace spaces with dashes
    # 4) Replace clusters of dashes with a single dash
    # 5) Keep first 5 words in the slug only
    ActiveRecord::Base.connection.execute(%{
        UPDATE data_portals
            SET url_slug = SUBSTRING_INDEX(REGEXP_REPLACE(REPLACE(LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9- ]', '')), ' ', '-'), '-+', '-'), '-', 5)
            WHERE url_slug IS NULL;
    })

    change_column :data_portals, :url_slug, :string, null: false
    add_index :data_portals, :url_slug, unique: true
  end

  def down
    remove_index :data_portals, :url_slug
    remove_column :data_portals, :url_slug
  end
end

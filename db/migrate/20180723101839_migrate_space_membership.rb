class MigrateSpaceMembership < ActiveRecord::Migration

  class Space < ActiveRecord::Base
    has_and_belongs_to_many :space_memberships
    has_many :old_space_memberships, foreign_key: "space_id", class_name: "SpaceMembership"
  end

  class SpaceMembership < ActiveRecord::Base
    has_and_belongs_to_many :space
  end

  def change
    add_belongs_to :spaces, :space

    create_table :space_memberships_spaces, id: false do |t|
      t.belongs_to :space, index: true
      t.belongs_to :space_membership, index: true
    end

    reversible do |dir|
      dir.up do
        Space.find_each do |space|
          space.space_memberships = space.old_space_memberships
        end
      end
      dir.down do
        Space.find_each do |space|
          space.old_space_memberships = space.space_memberships
        end
      end
    end

    remove_reference :space_memberships, :space, index: true, foreign_key: true
  end
end

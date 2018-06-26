class Node < ActiveRecord::Base
  include Auditor

  self.inheritance_column = :sti_type

  include Permissions

  belongs_to :user
  belongs_to :parent, { polymorphic: true }

  acts_as_taggable

  def title
    parent_type == "Asset" ? self.becomes(Asset).prefix : name
  end

  def space
    in_space? ? Space.from_scope(scope) : nil
  end

  def ancestors(scope)
    build_ancestors_tree(self, scope)
  end

  def parent_folder
    Folder.find_by(id: self[self.class.scope_column_name(scope)])
  end

  def self.scope_column_name(scope)
    scope == "private" ? :parent_folder_id : :scoped_parent_folder_id
  end

  private

  def build_ancestors_tree(start_from, scope)
    parents = []
    parent = Folder.find_by(id: start_from[self.class.scope_column_name(scope)])

    if parent
      parents << parent
      parents += build_ancestors_tree(parent, scope)
    end

    parents
  end

end

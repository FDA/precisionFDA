# == Schema Information
#
# Table name: nodes
#
#  id                      :integer          not null, primary key
#  dxid                    :string(255)
#  project                 :string(255)
#  name                    :string(255)
#  state                   :string(255)
#  description             :text(65535)
#  user_id                 :integer          not null
#  file_size               :bigint
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  parent_id               :integer
#  parent_type             :string(255)
#  scope                   :string(255)
#  parent_folder_id        :integer
#  sti_type                :string(255)
#  scoped_parent_folder_id :integer
#  uid                     :string(255)
#

class Node < ApplicationRecord
  include Auditor

  self.inheritance_column = :sti_type

  include Permissions

  belongs_to :user, required: true
  belongs_to :parent, polymorphic: true

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

  class << self
    def scope_column_name(scope)
      ["private", "public"].include?(scope) ? :parent_folder_id : :scoped_parent_folder_id
    end

    def folder_content(files, folders)
      Node.where(id: (files + folders).map(&:id))
    end
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

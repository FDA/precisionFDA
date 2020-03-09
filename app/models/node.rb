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

  # pFDA internal state, used for files that are being removing by a worker.
  STATE_REMOVING = "removing".freeze

  belongs_to :user, required: true
  belongs_to :parent, polymorphic: true

  has_many :participants, dependent: :destroy

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
    # Select nodes ids, which are not comparison input files.
    # Implemented to UserFile objexts only - folders are skipped.
    # @param ids [Array] - an array of nodes ids.
    # @return ids [Array] - an array of nodes ids, without comparison input files ids.
    #   They are excluded, if they were in @param.
    def sin_comparison_inputs(ids)
      ids.reject do |id|
        node = find(id)
        node.is_a?(UserFile) && node.comparisons.present?
      end
    end

    def scope_column_name(scope)
      ["private", "public"].include?(scope) ? :parent_folder_id : :scoped_parent_folder_id
    end

    def folder_content(files, folders)
      Node.where(id: (files + folders).map(&:id))
    end

    # Selects nodes (files and folders), permitted to be accessible/editable in space
    #   by current context user. A context permission level depends upon context role in space:
    #   contributor vs viewer.
    # @param space_context [Hash] of the following content:
    #   nodes_ids: [Array] - an array of nodes ids.
    #   context: [Context] - a context user object.
    #   space: [Space] - a space object.
    # @return nodes [Array] - an array of nodes objects, permitted for space context given.
    def permitted_in_space_context(space_context)
      context = space_context[:context]
      space = space_context[:space]
      nodes_ids = space_context[:nodes_ids]

      nodes = Node.accessible_by_space(space).where(id: nodes_ids)

      nodes = if space.contributor_permission(context)
        nodes.accessible_by(context)
      else
        nodes.editable_by(context)
      end

      nodes.to_a
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

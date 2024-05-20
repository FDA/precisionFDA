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
#  featured                :boolean          default(FALSE)
#

class Node < ApplicationRecord
  include Auditor
  extend Scopes
  include Scopes
  include Featured
  include ObjectLocation
  include TagsContainer

  self.inheritance_column = :sti_type

  include Permissions
  include CommonPermissions

  # pFDA internal state, used for files that are being removing by a worker.
  STATE_REMOVING = "removing".freeze

  belongs_to :user, required: true
  belongs_to :parent, polymorphic: true
  belongs_to :scoped_parent_folder, class_name: "Folder"

  has_many :properties, -> { where(target_type: "node") }, foreign_key: "target_id"
  attr_accessor :current_user

  scope :files_folders_assets, -> { where(sti_type: %w(Folder UserFile Asset)) } # used only in spaces
  scope :files, -> { where(sti_type: %w(UserFile)) }
  scope :folders, -> { where(sti_type: %w(Folder)) }

  acts_as_taggable

  class << self
    def scope_column_name(scope)
      if [SCOPE_PRIVATE, SCOPE_PUBLIC, nil].include?(scope)
        :parent_folder_id
      else
        :scoped_parent_folder_id
      end
    end

    def opposite_scope_column_name(scope)
      (%i(parent_folder_id scoped_parent_folder_id) - [scope_column_name(scope)]).first
    end

    def folder_content(files, folders)
      Node.where(id: (files + folders).map(&:id))
    end
  end

  # Collects a string of item's path.
  # @param dir_set [Array<String>] ordered array of folder names
  # @return [String] file path or "/" for root. Ex. "/second_level_folder/third_level_folder/"
  def collect_path_string(dir_set)
    path = "/"
    dir_set.each { |dir| path += "#{dir}/" }
    path
  end

  # Returns a full path to the current file or folder
  # @param [item_scope] the scope
  # @return [String] the path or "/" for root
  def full_path(item_scope = scope)
    parent_folder = parent_folder(item_scope)
    folders = []
    if parent_folder.blank?
      "/"
    else
      folders << parent_folder_name(item_scope)
      folders << parent_folder.ancestors(item_scope).pluck(:name)
    end

    collect_path_string(folders.flatten.reverse)
  end

  def parent_folder(file_scope = scope)
    column_name = Node.scope_column_name(file_scope)
    Folder.find_by(id: self[column_name])
  end

  # Returns a parent folder name of an item
  # @param [item_scope] the scope
  # @return [String] the name or "/" for root
  def parent_folder_name(item_scope = scope)
    folder = parent_folder(item_scope)
    folder.blank? ? "/" : folder.name
  end

  def title
    parent_type == "Asset" ? self.becomes(Asset).prefix : name
  end

  def space
    in_space? ? Space.from_scope(scope) : nil
  end

  def ancestors(scope)
    build_ancestors_tree(self, scope)
  end

  def scope_column_name
    self.class.scope_column_name(scope)
  end

  def opposite_scope_column_name
    self.class.opposite_scope_column_name(scope)
  end

  def folder_id
    self[scope_column_name]
  end

  # Check, whether node is publishable. A node should be 'private' or in space.
  # @param user [User] A user who is going to publish.
  # @return [Boolean] Returns true if a node can be published by a user, false otherwise.
  def publishable?(user)
    user.present? && !public?
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

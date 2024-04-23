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
#  entity_type             :integer          default("regular"), not null
#  featured                :boolean          default(FALSE)
#

class Folder < Node # :nodoc:
  MAX_NAME_LENGTH = 255

  scope :private_for, ->(context) { where(user_id: context.user.id, scope: SCOPE_PRIVATE) }
  scope :private_for_user, ->(user) { where(user_id: user.id, scope: SCOPE_PRIVATE) }

  validates :name,
            presence: { message: "Name could not be blank" },
            length: {
              maximum: MAX_NAME_LENGTH,
              too_long: "Name could not be longer than #{MAX_NAME_LENGTH} characters.",
            }

  # rubocop:disable Style/FormatStringToken
  validates :name,
            uniqueness: { scope: %i(user_id scope parent_folder_id),
                          case_sensitive: true,
                          message: "A folder with the name '%{value}' already exists.",
                          if: -> { private? } }

  validates :name,
            uniqueness: { scope: %i(scope scoped_parent_folder_id),
                          case_sensitive: true,
                          message: "A folder with the name '%{value}' already exists.",
                          unless: -> { private? } }
  # rubocop:enable Style/FormatStringToken

  scope :not_removing, -> { where.not(state: STATE_REMOVING).or(where(state: nil)) }

  class << self
    # Returns folder count of user 'private' scope.
    # Is used in for user serializer in Home
    # @param [User] User object
    # @return [Integer] Folder count.
    def private_count(user)
      private_for_user(user).count
    end

    def batch_private_folders(context, parent_folder_id = nil)
      Folder.
        private_for(context).
        where(parent_folder_id: parent_folder_id)
    end

    def batch_space_folders(spaces_params)
      Folder.
        editable_in_space(spaces_params[:context], spaces_params[:spaces_members_ids]).
        includes(:taggings).
        where(
          scope: spaces_params[:scopes],
          scoped_parent_folder_id: spaces_params[:scoped_parent_folder_id],
        )
    end
  end

  def klass
    "folder"
  end

  def blocked?
    state == STATE_REMOVING
  end

  def editable_by?(context)
    public? ? context.user.can_administer_site? : super
  end

  def has_in_children?(node)
    found = children.where(id: node.id).present?

    unless found
      sub_folders.each do |folder|
        found = folder.has_in_children?(node)
        break if found
      end
    end

    found
  end

  def children
    Node.where(scope_column_name => id, scope: scope)
  end

  def sub_folders
    children.where(sti_type: "Folder")
  end

  def files
    children.where(sti_type: "UserFile")
  end

  def all_files(where = {})
    collected = []

    children.merge(where).each do |node|
      if node.is_a?(Folder)
        collected += node.all_files(where)
      else
        collected << node
      end
    end

    collected
  end

  def all_children(where = {})
    collected = children.merge(where).to_a
    sub_folders.each { |folder| collected += folder.all_children(where).to_a }
    collected
  end
end

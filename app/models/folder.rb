class Folder < Node

  MAX_NAME_LENGTH = 255

  scope :private_for, lambda { |context| where(user_id: context.user.id, scope: "private") }

  validates :name,
            presence: { message: "Name could not be blank" },
            length: {
              maximum: MAX_NAME_LENGTH,
              too_long: "Name could not be longer than #{MAX_NAME_LENGTH} characters."
            }

  validates_uniqueness_of :name,
                          scope: %i[user_id scope parent_folder_id],
                          message: "This folder already has node named '%{value}'",
                          if: lambda { private? }

  validates_uniqueness_of :name,
                          scope: %i[scope scoped_parent_folder_id],
                          message: "This folder already has node named '%{value}'",
                          unless: lambda { private? }

  def klass
    "folder"
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
    Node.where(Node.scope_column_name(scope) => self.id)
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

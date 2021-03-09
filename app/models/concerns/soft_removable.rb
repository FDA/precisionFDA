# Set of Spaces/Methods for Soft Deletion entities.
module SoftRemovable
  extend ActiveSupport::Concern

  included do
    scope :unremoved, -> { where(deleted: false) }
  end

  def not_deleted?
    !deleted
  end
end

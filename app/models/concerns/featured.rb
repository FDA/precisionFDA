# Set of Spaces/Methods for Featured entities.
module Featured
  extend ActiveSupport::Concern

  included do
    scope :featured, -> { where(featured: true) }
  end
end

# Includes methods/scopes for Taggable elements.
module TagsContainer
  extend ActiveSupport::Concern

  included do
    acts_as_taggable
    scope :search_by_tags, lambda { |tags|
      tagged_with(tags, on: :tags, wild: true, any: true) if tags.present?
    }
  end
end

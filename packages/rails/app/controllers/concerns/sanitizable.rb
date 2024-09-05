# Sanitization concern against XSS attacks.
module Sanitizable
  extend ActiveSupport::Concern
  include ActionView::Helpers::SanitizeHelper

  def sanitize_field(entity, field = :content)
    entity[field] = sanitize(entity[field]) if entity[field]
    entity
  end

  def sanitize_content(content)
    sanitize(content)
  end
end

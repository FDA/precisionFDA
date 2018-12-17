class SpaceTemplateSpace < ActiveRecord::Base
  belongs_to :space
  belongs_to :space_template
end

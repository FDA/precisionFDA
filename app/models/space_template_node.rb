class SpaceTemplateNode < ApplicationRecord
  belongs_to :space_templates
  belongs_to :node, polymorphic: true
  attr :name
  def name
    node.name
  end
end

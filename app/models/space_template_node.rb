# == Schema Information
#
# Table name: space_template_nodes
#
#  id                :integer          not null, primary key
#  space_template_id :string(255)
#  node_id           :integer
#  node_type         :string(255)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  space_id          :string(255)
#  node_name         :string(255)
#

class SpaceTemplateNode < ApplicationRecord
  belongs_to :space_templates
  belongs_to :node, polymorphic: true
  attr :name
  def name
    node.name
  end
end

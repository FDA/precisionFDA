# == Schema Information
#
# Table name: participants
#
# title       :string
# image_url   :string       limit: 255
# node_id     :integer      limit: 4
# public      :boolean
# kind        :integer      limit: 4, default: 0
# position    :integer      limit: 4, default: 0
# created_at  :datetime     not null
# updated_at  :datetime     not null
#
class Participant < ApplicationRecord
  enum kind: %i(invisible org person)

  validates :title, :image_url, presence: true

  belongs_to :file, class_name: "Node", foreign_key: "node_id"

  scope :positioned, -> { order(position: :ASC, id: :ASC) }
  scope :by_file, ->(file) { where(node_id: file.id) }

  # Returns an uid of a participant's image file if it's not blank.
  def file_uid
    file.uid if file.present?
  end
end

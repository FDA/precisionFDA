# == Schema Information
#
# Table name: participants
#
#  id         :integer          not null, primary key
#  title      :string(255)
#  image_url  :string(255)
#  node_id    :integer
#  public     :boolean
#  kind       :integer          default("invisible")
#  position   :integer          default(0)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
class Participant < ApplicationRecord
  enum kind: { invisible: 0, org: 1, person: 2 }

  validates :title, :image_url, presence: true

  belongs_to :file, class_name: "UserFile", foreign_key: :node_id, inverse_of: :participants

  scope :positioned, -> { order(:position, :id) }
end

class   Participant < ActiveRecord::Base

  enum kind: %i(invisible org person)

  validates :title, :image_url, presence: true

  belongs_to :file, class_name: 'Node', foreign_key: 'node_id'

  scope :positioned, -> { order(position: :ASC, id: :ASC) }
  scope :by_file, ->(file) { where(node_id: file.id) }

  def file_dxid
    file.dxid if file.present?
  end
end

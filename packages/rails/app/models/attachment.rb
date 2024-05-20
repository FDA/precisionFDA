# == Schema Information
#
# Table name: attachments
#
#  id        :integer          not null, primary key
#  note_id   :integer
#  item_id   :integer
#  item_type :string(255)
#

class Attachment < ApplicationRecord
  include Auditor

  belongs_to :note
  belongs_to :item, polymorphic: true

  scope :file_attachments, ->(file_id) { where(item_id: file_id, item_type: %w(Node UserFile)) }
end

# == Schema Information
#
# Table name: data_portals
#
#  id                   :integer          not null, primary key
#  name                 :string(255)
#  description          :text(65535)
#  content              :text(65535)
#  editor_state         :text(65535)
#  space_id             :integer
#  card_image_url       :string(255)
#  card_image_id        :string(255)
#  sort_order           :integer
#  status               :string(255)
#  default              :boolean
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
class DataPortal < ApplicationRecord
  include Auditor

  STATUS_OPEN = "open".freeze
  STATUS_CLOSED = "closed".freeze

  belongs_to :space
end

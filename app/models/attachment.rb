# == Schema Information
#
# Table name: attachments
#
#  id        :integer          not null, primary key
#  note_id   :integer
#  item_id   :integer
#  item_type :string
#

class Attachment < ActiveRecord::Base
  include Auditor

  belongs_to :note
  belongs_to :item, polymorphic: true
end

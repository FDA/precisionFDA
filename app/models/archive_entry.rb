# == Schema Information
#
# Table name: archive_entries
#
#  id       :integer          not null, primary key
#  path     :text(65535)
#  name     :string(255)
#  asset_id :integer
#

class ArchiveEntry < ApplicationRecord
  include Auditor

  belongs_to :asset
end

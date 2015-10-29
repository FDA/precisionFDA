# == Schema Information
#
# Table name: archive_entries
#
#  id       :integer          not null, primary key
#  path     :text
#  name     :string
#  asset_id :integer
#

class ArchiveEntry < ActiveRecord::Base
  belongs_to :asset
end

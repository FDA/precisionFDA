# == Schema Information
#
# Table name: licensed_items
#
#  id               :integer          not null, primary key
#  license_id       :integer
#  licenseable_id   :integer
#  licenseable_type :string
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#

class LicensedItem < ActiveRecord::Base
  include Auditor

  belongs_to :license
  belongs_to :licenseable, polymorphic: true
end

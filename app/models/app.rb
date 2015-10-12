# == Schema Information
#
# Table name: apps
#
#  id         :integer          not null, primary key
#  dxid       :string
#  series     :string
#  project    :string
#  version    :string
#  is_latest  :boolean
#  is_applet  :boolean
#  name       :string
#  title      :string
#  readme     :text
#  user_id    :integer
#  scope      :string
#  spec       :text
#  internal   :text
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class App < ActiveRecord::Base
  belongs_to :user
  has_many :jobs

  store :spec, accessors: [ :input_spec, :output_spec, :internet_access, :instance_type ], coder: JSON
  store :internal, accessors: [ :ordered_assets, :packages, :code ], coder: JSON

  def self.accessible_by(user_id, org_id)
    raise unless user_id.present? && org_id.present?
    return where.any_of({user_id: user_id}, {scope: "public"}, {scope: org_id.to_s})
  end

end

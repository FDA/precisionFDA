# == Schema Information
#
# Table name: orgs
#
#  id         :integer          not null, primary key
#  handle     :string(255)
#  name       :string(255)
#  admin_id   :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  address    :text(65535)
#  duns       :string(255)
#  phone      :string(255)
#  state      :string(255)
#  singular   :boolean
#  fedramp    :boolean          default(FALSE)
#

class Org < ApplicationRecord
  default_scope { where.not(state: "deleted") }

  PFDA_PREFIX = "org-pfda..".freeze

  include Auditor

  validates :handle, presence: true, uniqueness: { case_sensitive: false }
  validates :name, presence: true

  has_many :users
  has_many :org_action_requests
  belongs_to :admin, class_name: "User"

  has_one :dissolve_org_action_request,
          -> { where(action_type: OrgActionRequest::Type::DISSOLVE) },
          class_name: "OrgActionRequest"

  def self.construct_dxorg(handle)
    raise unless handle.present? && handle =~ /^[0-9a-z][0-9a-z_.]*$/

    PFDA_PREFIX + handle
  end

  def self.handle_by_id(id)
    id.sub(/^org-/, '')
  end

  def self.featured
    Org.find_by(handle: ORG_EVERYONE_HANDLE)
  end

  def self.real_orgs
    where(singular: false)
  end

  def self.reports(sheet)
    order(:name).find_each do |org|
      %w(name handle address phone).each do |label|
        sheet.add_row ["Organization #{label}:", org.send(label)]
      end
      org.admin_in_report(sheet)
      org.users_in_report(sheet)
    end
    sheet
  end

  def admin_in_report(sheet)
    if admin.blank?
      sheet.add_row ["Warning: No admin exists for this Org: #{handle}"]
    else
      sheet.add_row [
        "Admin:", "", admin.dxuser, admin.first_name,
        admin.last_name, admin.email, admin.created_at.strftime("%Y-%m-%d %H:%M"),
        admin.last_login ? admin.last_login.strftime("%Y-%m-%d %H:%M") : "",
        admin.user_files.sum(:file_size), admin.app_series.count, admin.jobs.count,
      ]
    end
  end

  def users_in_report(sheet)
    if users.exists?
      users = self.users.order(:dxuser).all.reject { |u| u.id == admin_id }
      users.each do |user|
        if user.blank?
          sheet.add_row ["No data for user #{user.dxuser} in Org: #{handle}"]
        else
          role = user.id == admin_id ? "Admin:" : "Member:"
          sheet.add_row [
            role, "", user.dxuser, user.first_name, user.last_name, user.email,
            user.created_at.strftime("%Y-%m-%d %H:%M"),
            user.last_login ? user.last_login.strftime("%Y-%m-%d %H:%M") : "",
            user.user_files.sum(:file_size), user.app_series.count, user.jobs.count,
          ]
        end
      end
    else
      sheet.add_row ["Warning: No users (Admin or Member) exists for this Org: #{handle}"]
    end
    sheet.add_row
  end

  def real_org?
    !singular
  end

  def dxid
    PFDA_PREFIX + handle
  end

  def dxorg
    Org.construct_dxorg(handle)
  end
end

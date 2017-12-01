# == Schema Information
#
# Table name: spaces
#
#  id            :integer          not null, primary key
#  name          :string
#  description   :text
#  host_project  :string
#  guest_project :string
#  host_dxorg    :string
#  guest_dxorg   :string
#  space_type    :string
#  state         :string
#  meta          :text
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#

class Space < ActiveRecord::Base
  validates :space_type, presence: true, inclusion: {in: ['group', 'submission']}

  has_many :space_memberships
  has_many :users, {through: :space_memberships}

  acts_as_commentable

  store :meta, accessors: [:cts], coder: JSON
  attr_accessor :host_lead_dxuser, :guest_lead_dxuser, :invitees, :invitees_role

  def uid
    "space-#{id}"
  end

  def title
    name
  end

  def klass
    "space"
  end

  def describe_fields
    ["title", "description", "state"]
  end

  def created_at_in_ny
    created_at.in_time_zone("America/New_York")
  end

  def to_param
    if name.nil?
      id.to_s
    else
      "#{id}-#{name.parameterize}"
    end
  end

  def active?
    state == "ACTIVE"
  end

  def rename(new_name, context)
    update_attributes(name: new_name)
  end

  def host_lead
    host_lead_member.user
  end

  def host_lead_member
    space_memberships.hosts.admins.first
  end

  def host_lead?(context)
    host_lead.id == context.user_id
  end

  def guest_lead
    guest_lead_member.user
  end

  def guest_lead_member
    space_memberships.guests.admins.first
  end

  def guest_lead?(context)
    guest_lead.id == context.user_id
  end

  def project_for_user!(user)
    space_memberships.find_by!(user_id: user.id).project
  end

  def authorized_users_for_apps
    return [host_dxorg, guest_dxorg]
  end

  def add_or_update_member(api, org_id, dxuser, role, side)
    user = User.find_by(dxuser: dxuser)
    if !user.nil?
      member = space_memberships.find_by(user_id: user.id)
      if member.nil?
        api.call(org_id, "invite", {invitee: user.dxid, level: role, suppressEmailNotification: true})
        member = space_memberships.create!(user_id: user.id, role: role, side: side)
      elsif ![guest_lead.id, host_lead.id].include?(member.user.id)
        if member.side == side
          apiParam = {}
          if member.role == "ADMIN" && role != "ADMIN"
            apiParam[user.dxid] = {
              level: role,
              allowBillableActivities: false,
              appAccess: true,
              projectAccess: "CONTRIBUTE"
            }
          else
            apiParam[user.dxid] = {
              level: role
            }
          end
          api.call(org_id, "setMemberAccess", apiParam)
          member.update_attributes(role: role)
          member.reload
        else
          # TODO: remove from SIDE and create new invite
        end
      else
        return false
      end
      return member
    else
      return false
    end
  end

  def remove_member(api, org_id, dxuser)
    user = User.find_by(dxuser: dxuser)
    if !user.nil?
      member = space_memberships.find_by(user_id: user.id)
      if !member.nil?
        api.call(org_id, "removeMember", {user: user.dxid})
        member.destroy
      end
    end
  end

  def create_space_project(context, contribute_org, view_org, admin)
    api = DNAnexusAPI.new(context.token)
    space_project = api.call("project", "new", {name: "precisionfda-space-#{id}-#{admin[:side]}", billTo: admin.user.billto})["id"]
    api.call(space_project, "invite", {invitee: contribute_org, level: "CONTRIBUTE", suppressEmailNotification: true, suppressAllNotifications: true})
    api.call(space_project, "invite", {invitee: view_org, level: "VIEW", suppressEmailNotification: true, suppressAllNotifications: true})
    return space_project
  end

  def state_hash
    state.blank? ? { "UNACTIVATED" => "NULL" } : { state => state }
  end

  # space:
  #   name
  #   description
  #   space_type ("submission")
  #   meta
  #   host_lead_dxuser
  #   guest_lead_dxuser
  #
  def self.provision(context, space_params)
    raise unless space_params[:host_lead_dxuser] != space_params[:guest_lead_dxuser]

    papi = DNAnexusAPI.new(ADMIN_TOKEN)
    space = nil
    Space.transaction do
      uuid = SecureRandom.hex
      host_dxorg = Org.construct_dxorg("space_host_#{uuid}")
      guest_dxorg = Org.construct_dxorg("space_guest_#{uuid}")
      host_dxorghandle = host_dxorg.sub(/^org-/, '')
      guest_dxorghandle = guest_dxorg.sub(/^org-/, '')

      # Provision Host and Guest orgs
      Org.provision_dxorg(context, {
        id: host_dxorg,
        handle: host_dxorghandle,
        name: host_dxorghandle
      })

      Org.provision_dxorg(context, {
        id: guest_dxorg,
        handle: guest_dxorghandle,
        name: guest_dxorghandle
      })

      # Create the space
      space_params[:host_dxorg] = host_dxorg
      space_params[:guest_dxorg] = guest_dxorg
      space = Space.create!(space_params)

      # Add leads as ADMINs
      host_lead = space.add_or_update_member(papi, host_dxorg, space_params[:host_lead_dxuser], 'ADMIN', 'HOST')
      guest_lead = space.add_or_update_member(papi, guest_dxorg, space_params[:guest_lead_dxuser], 'ADMIN', 'GUEST')

      # Remove pfda admin from orgs
      papi.call(host_dxorg, "removeMember", {user: ADMIN_USER})
      papi.call(guest_dxorg, "removeMember", {user: ADMIN_USER})
    end

    return space
  end

  def self.active
    where(state: "ACTIVE")
  end

  def self.submissions
    where(space_type: "submission")
  end

  def self.groups
    where(space_type: "group")
  end

  def self.from_scope(scope)
    if scope =~ /^space-(\d+)$/
      return Space.find_by!(id: $1.to_i)
    else
      raise "Invalid scope #{scope} in Space.from_scope"
    end
  end

  def editable_by?(context)
    if !context.guest?
      raise unless context.user_id.present?
      space_memberships.exists?(user_id: context.user_id, role: 'ADMIN')
    end
  end

  def accessible_by?(context)
    if !context.guest?
      raise unless context.user_id.present?
      space_memberships.exists?(user_id: context.user_id)
    end
  end

  def self.editable_by(context)
    if !context.guest?
      raise unless context.user_id.present?
      joins(:space_memberships).where(space_memberships: {user_id: context.user_id, role: 'ADMIN'}).uniq
    end
  end

  def self.accessible_by(context)
    if !context.guest?
      raise unless context.user_id.present?
      joins(:space_memberships).where(space_memberships: {user_id: context.user_id}).uniq
    end
  end
end

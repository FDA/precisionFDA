# == Schema Information
#
# Table name: space_events
#
#  id                  :integer         not null, primary key
#  user_id             :integer         not null
#  space_id            :integer         not null
#  entity_id           :integer         not null
#  entity_type         :string          not null
#  side                :integer         not null
#  activity_type       :integer         not null
#  created_at          :datetime        not null
#  object_type         :integer         not null
#  role                :integer         not null
#

class SpaceEvent < ActiveRecord::Base
  OBJECT_TYPES = %i(
    space
    membership
    task
    comment
    app
    job
    file
    asset
    comparison
    workflow
    note
  )

  ACTIVITY_TYPES = %i(
    membership_added
    membership_disabled
    membership_changed
    task_created
    task_reassigned
    task_completed
    task_declined
    task_deleted
    job_added
    job_completed
    file_added
    file_deleted
    note_added
    app_added
    asset_added
    asset_deleted
    comparison_added
    workflow_added
    comment_added
    comment_edited
    comment_deleted
    space_locked
    space_unlocked
    space_deleted
  )

  ROLES = %i(
    admin
    member
    viewer
    lead
  )

  DATA_ATTRIBUTES = {
    :comment    => %i(body),
    :app        => %i(title),
    :note       => %i(title),
    :space      => %i(name),
    :task       => %i(name),
    :job        => %i(name),
    :file       => %i(name uid),
    :asset      => %i(name uid),
    :comparison => %i(name),
    :workflow   => %i(name),
  }

  belongs_to :user
  belongs_to :space
  belongs_to :entity, polymorphic: true

  enum side: [:reviewer, :sponsor]
  enum activity_type: ACTIVITY_TYPES
  enum object_type: OBJECT_TYPES
  enum role: ROLES

  store :data, coder: JSON

  scope :date_range, ->(start_date=nil, end_date=nil) {
    if start_date && end_date
      where("created_at BETWEEN :start AND :end", start: start_date.beginning_of_day, end: end_date.end_of_day)
    elsif start_date
      where("created_at >= ?", start_date.beginning_of_day)
    elsif end_date
      where("created_at <= ?", end_date.end_of_day)
    else
      all
    end
  }
  before_create :sort_object_type, :generate_data

  def activity
    activity_type.split("_").join(" ").capitalize
  end

  def entity_name
    case object_type
    when "file", "asset"
      data["uid"]
    when "space", "task", "job", "comparison", "workflow"
      data["name"]
    when "comment"
      data["body"]
    when "app"
      entity.title
    when "note"
      data['title']
    when "membership"
      "#{data['full_name']}(#{data['role']})"
    else
      ""
    end
  end

  def additional_info
    return if self.entity.nil?
    if self.comment? && (obj = self.entity.content_object)
      name =
        if obj.klass == "file"
          obj.dxid
        else
          obj.try(:name) || obj.try(:title)
        end
      {
        comment_object_name: name,
        comment_object_type: obj.klass,
      }
    end
  end

  def data
    super || {}
  end

  def self.describe_events(collection, page = 1)
    events = collection.includes(:user, :entity)
    events.page(page).per(10)
      .map do |event|
        {
          id: event.id,
          activity_type: event.activity,
          object_type: event.object_type,
          created_at: event.created_at.strftime("%m/%d/%Y"),
          username: event.user.username,
          user_fullname: event.user.full_name,
          entity_name: event.entity_name,
          entity: event.entity,
          additional_info: event.additional_info,
        }
      end
  end

  def self.collection(start_date, end_date, filters = {})
    sort = filters[:sort] ? filters[:sort] : "asc"
    filters.delete(:sort)
    filters.reject! { |k, v| v == "" || v.nil? || v == "null" }
    if filters[:object_type] == "[]"
      filters[:object_type] = []
    end

    filters[:user_id] = filters.delete(:users) if filters[:users]
    filters[:role] = filters.delete(:roles) if filters[:roles]
    SpaceEvent.date_range(start_date, end_date).where(filters).order(created_at: sort)
  end

  def self.object_type_counters(start_date = nil, end_date = nil, filters = {})
    events = SpaceEvent.collection(start_date, end_date, filters).group(:object_type).count

    OBJECT_TYPES.each_with_index do |type, i|
      events[i] = 0 unless events[i]
      events[type] = events.delete(i)
    end

    events.map { |k, v| { name: k, value: v, type_id: SpaceEvent.object_types[k] } }
  end

  def self.group_by_hour
    select("DATE_FORMAT(created_at, '%Y-%m-%d %H:00') AS date").group("date")
  end

  def self.group_by_day
    select("DATE(created_at) as date").group("date")
  end

  def self.group_by_month
    select("DATE(DATE_FORMAT(created_at, '%Y-%m-01')) AS date").group("date")
  end

  def self.select_count
    select("COUNT(id) as count")
  end

  private

  def sort_object_type
    self.object_type = activity_type.split("_").first
  end

  def generate_data
    new_data = SpaceEvent::DATA_ATTRIBUTES.find(-> {{}}) do |type, attributes|
      break entity.slice(*attributes) if type.to_s == self.object_type
    end

    if self.membership?
      new_data['role'] = entity.role
      new_data['full_name'] = entity.user.full_name
    end

    self.data = new_data
  end

end

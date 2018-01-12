class Event < ActiveRecord::Base

  scope :date_range, ->(begin_at, end_at) { where(created_at: begin_at..end_at) }

  def self.event_attribute(name, db_column: nil)
    db_name = db_column ? db_column : name
    event_attributes.add(name, db_name)
  end

  def self.event_attributes
    @event_attributes ||= Attributes.new
  end

  def self.sum_by(attribute)
    self.sum(event_attributes.find_by_name(attribute).db_name)
  end

  def self.select_sum(attribute)
    event = event_attributes.find_by_name(attribute)
    select("SUM(#{event.db_name}) as #{event.name}")
  end

  def self.select_count
    select("COUNT(id) as count")
  end

  def self.select_count_uniq_by(attribute)
    event = event_attributes.find_by_name(attribute)
    select("COUNT(DISTINCT #{event.db_name}) as count")
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

  def initialize(data)
    super self.class.event_attributes.prepare_data(data)
  end

end



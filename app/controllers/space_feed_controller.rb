class SpaceFeedController < ApplicationController
  def index
    collection = SpaceEvent.collection(start_date, end_date, feed_filter_params)
    results = SpaceEvent.describe_events(collection, page)
      .map { |res| find_path(res) }
    render json: results
  end

  def object_types
    render json: SpaceEvent.object_type_counters(start_date, end_date, filter_params)
  end

  def chart
    render json: SpaceEvents.new(start_date, end_date, filter_params)
  end

  private

  def start_date
    Time.parse(params[:date_at]) if params[:date_at].presence
  end

  def end_date
    Time.parse(params[:date_to])
  rescue
    Time.now
  end

  def feed_filter_params
    params.permit(:sort, :space_id, :side, :object_type, role: [], user_id: [], object_type: [])
  end

  def filter_params
    params.permit(:space_id, :side, :object_type, role: [], user_id: [], object_type: [])
  end

  def page
    if params[:page].presence
      params[:page].to_i
    end
  rescue
    1
  end

  def find_path(event)
    event[:entity_url] =
      case event[:object_type]
      when "comment", "membership"
        ""
      else
        pathify(event[:entity])
      end
    event
  end
end

class SpaceFeedController < ApplicationController
  def index
    collection = SpaceEvent.collection(start_date, end_date, filter_params, sort)
    results = SpaceEvent.describe_events(collection)
    render json: results
  end

  def object_types
    render json: SpaceEvent.object_type_counters(start_date, end_date)
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

  def filter_params
    params.permit(:side, role: [], user_id: [], object_type: [])
  end

  def sort
    ["asc", "desc"].include?(params[:sort]) ? params[:sort] : "asc"
  end
end

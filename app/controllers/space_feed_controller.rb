class SpaceFeedController < ApplicationController
  before_action :find_space

  def index
    collection = SpaceEvent.collection(start_date, end_date, feed_filter_params)
    results = SpaceEvent.describe_events(collection, page)
      .map { |res| find_path_for_object(res) }
      .map { |res| find_path_for_comments(res) }

    render json: results
  end

  def object_types
    render json: SpaceEvent.object_type_counters(start_date, end_date, counters_filter_params)
  end

  def chart
    render json: SpaceEvents.new(start_date, end_date, filter_params)
  end

  private

  def start_date
    Time.parse(params[:date_at]) if params[:date_at].present?
  end

  def end_date
    Time.parse(params[:date_to])
  rescue
    Time.now
  end

  def feed_filter_params
    params.permit(:sort, :space_id, :side, :object_type, roles: [], users: [], object_type: [])
  end

  def counters_filter_params
    params.permit(:space_id, :side, roles: [], users: [])
  end

  def filter_params
    params.permit(:space_id, :side, :object_type, roles: [], users: [], object_type: [])
  end

  def page
    if params[:page].present?
      params[:page].to_i
    end
  rescue
    1
  end

  def find_path_for_object(event)
    event[:entity_url] = ""
    entity = event[:entity]
    return event unless entity

    event[:entity_url] =
      case event[:object_type]
      when "comment", "membership"
        ""
      when "task"
        if TaskPolicy.can_see?(entity, @membership)
          pathify(entity)
        else
          ""
        end
      else
        if entity.accessible_by?(@context)
          pathify(entity)
        else
          ""
        end
      end

    event
  end

  def find_path_for_comments(event)
    if event.dig(:additional_info, :comment_object_name)
      event[:additional_info][:comment_object_url] =
        if event[:entity].content_object.accessible_by?(@context)
          pathify(event[:entity].content_object)
        else
          ""
        end
    end

    event
  end

  def fetch_membership
    if @context.review_space_admin?
      membership = @space.space_memberships.active.find_by(user_id: @context.user_id)
      membership || SpaceMembership.new_by_admin(@context.user)
    else
      @space.space_memberships.active.find_by!(user_id: @context.user_id)
    end
  end

  def find_space
    @space = Space.accessible_by(@context).find_by_id(params[:space_id])
    unless @space
      render json: []
      return
    end
    @membership = fetch_membership
    unless @membership
      render json: []
      return
    end
  end
end

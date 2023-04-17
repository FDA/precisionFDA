# Includes pagination attributes for serializers.
module Paginationable
  extend ActiveSupport::Concern

  PAGE_SIZE = 10
  DEFAULT_PAGE = 1

  # Emulate pagination for simple array and return some meta.
  # @param total_count [Int] count of array.
  # @return [Hash] Object that contains current/next/prev/total pages.
  def pagination_meta(total_count)
    current_page = page_from_params.to_i
    total_pages = (total_count / page_size.to_f).ceil
    {
      count: total_count,
      pagination: {
        current_page: current_page,
        next_page: current_page < total_pages ? current_page + 1 : nil,
        prev_page: current_page > 1 ? current_page - 1 : nil,
        total_pages: total_pages,
        total_count: total_count,
      },
    }
  end

  # Extract pagination from query result and return some meta.
  # @param collection [ActiveRecord::Relation<Apps>].
  # @return [Hash] Object that contains current/next/prev/total pages.
  def pagination_dict(collection)
    {
      current_page: collection.try(:current_page) || DEFAULT_PAGE,
      next_page: collection.try(:next_page),
      prev_page: collection.try(:prev_page),
      total_pages: collection.try(:total_pages) || 0,
      total_count: collection.try(:total_count) || 0,
    }
  end

  # Get Page from params.
  # @return 1 if no param values provided.
  def page_from_params
    page_num = params[:page].to_i

    page_num.zero? ? DEFAULT_PAGE : page_num
  end

  # Manually 'paginate' array of Apps
  # @param apps [App] array of App's.
  # @return apps [App] sub-array of Apps in page range.
  def paginate_array(apps)
    current_page = page_from_params
    from = (current_page - 1) * page_size
    to = [current_page * page_size, apps.count].min - 1

    apps.values_at(from..to)
  end

  def page_size
    # max 100 per page if per_page param is over 100
    per_page = [params[:per_page].to_i, 100].min
    per_page.zero? ? PAGE_SIZE : per_page
  end
end

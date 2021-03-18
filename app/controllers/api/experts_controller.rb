module Api
  # Experts API controller.
  class ExpertsController < BaseController
    include Paginationable

    skip_before_action :require_api_login
  
    def index
      page = params[:page].presence || 1
      year = params[:year] =~ /\A\d+\Z/ ? params[:year].to_i : nil

      experts = Expert.viewable_by(@context).order(created_at: :desc)
      experts = experts.where(Arel.sql("YEAR(created_at) = #{year}")) if year
  
      render json: experts,
             meta: pagination_dict(experts),
             adapter: :json
    end

    def years
      all_years = Expert.order(created_at: :desc).pluck(:created_at).map(&:year).uniq
      render json: all_years
    end
  end
end

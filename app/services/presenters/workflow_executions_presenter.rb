module Presenters
  ##
  # *WorkflowExecutionPresenter* displays workflow executions (Analyses) with their workflow jobs
  # and handles filtering and pagination. It supposed to have one workflow and different types of
  # its analyses: batch and single.
  #
  #   presenter = WorkflowExecutionsPresenter.new(page, context, params).call
  #
  #   payload = { jobs: presenter.response, meta: pagination_meta(presenter.size) }
  #
  class WorkflowExecutionsPresenter
    include Sortable
    include Paginationable
    include Sortable

    # Collection of serialized records.
    # @return [Array] Array of serialized job hashes
    attr_accessor :response
    # Used in pagination meta.
    # @return [integer]
    attr_reader :size

    ORDER_PARAMS_MAP = {
      name: :name,
      username: :launched_by,
      app_title: :app_title,
      created_at: :created_at_date_time,
      launched_on: :created_at_date_time,
    }.freeze

    # Instance of WorkflowExecutionsPresenter initializes with filter params from controller
    # context and ActiveRecord association of Analyses.
    # @param analyses [Analysis]
    # @param contest [Context]
    # @param params permitted params
    def initialize(analyses, context, params = {})
      @context = context
      @analyses = Array.wrap analyses
      @params = params.symbolize_keys
      @filters = params[:filters]
      @matcher = lambda do |hash|
        (hash.keys & filters.symbolize_keys.keys).present? &&
          filters.all? do |k, v|
            v.to_s.downcase.in? hash.fetch(k.to_sym, "").downcase
          end
      end
      @response = []
      @size = 0
      @ids = []
    end

    # Process serialization of analyses. It can be a single analysis or a batch. In this case we
    # use @ids to remember serialized analysis. If analysis have batch_items we have to serialize
    # all batch analysis and collect serialized +ids+ to check if analysis was processed, if it
    # was - serialize it and collect its id, if was not - skip serialization step and return an
    # empty array.
    #
    # Returns serialized Analyses filtered and splitted by params and returns itself to use
    #   #response
    # and
    #   #size
    # methods to build controller response.
    def call
      serialize_records
      filter_records if filters.present?
      sort_records if params[:order_by].present?
      select_pages

      self
    end

    private

    attr_accessor :ids
    attr_reader :analyses, :context, :params, :filters, :matcher, :sorter

    # To collect serialized records in @response
    def serialize_records #:nodoc:
      @response = analyses.map { |record| serialized_analysis(record) }.flatten
      @size = @response.size
    rescue NoMethodError
      @response << Message.can_not_serialize
    end

    # @param analyses [Analysis]
    def serialized_analysis(analysis)
      if analysis.batch_items.present? && (analysis.batch_items.map(&:id) & ids).empty?
        analysis.batch_items.map { |a| ids << a.id }
        serialized_batch_analysis(analysis.batch_items)
      elsif !analysis.id.in? ids
        ids << analysis.id
        serialized_workflow(analysis)
      else
        ids << analysis.id
        []
      end
    end

    # Serialize batch analysis.
    # Adds for example _(1 of 3)_ label to Analysis title.
    # @param analyses [Analysis]
    def serialized_batch_analysis(analyses)
      analyses.map.with_index(1) do |analysis, idx|
        serialized_workflow(analysis, [idx, analyses.size], :batch)
      end
    end

    # Call AnalysisSerializer through a Rails Cache with ttl 1 minute to reduce DB load while
    # doing filter subsequent requests.
    # @param [Analysis]
    def serialized_workflow(analysis, idx = [], type = :workflow)
      analysis_cache_key = [analysis.dxid, idx, analysis.updated_at, context.user_id].join(":")
      Rails.cache.fetch(analysis_cache_key, expires_in: 1.minute) do
        analysis.current_user = @context.user
        AnalysisSerializer.new(
          analysis,
          type: type,
          meta: idx,
        ).serializable_hash
      end
    end

    # filter all response records with +#matcher+ lambda selection within +@params+
    def filter_records
      # For filtering by workflow_title
      filters[:name] = filters.delete :workflow_title if filters.key?(:workflow_title)
      # For filtering launched_by via 'username' to normalize execution filter keys with JobsFilter
      filters[:launched_by] = filters.delete :username if filters.key?(:username)
      @response = response.each do |record|
        record[:jobs] = record.fetch(:jobs, []).select(&matcher)
      end
      @response = response.filter { |f| f[:jobs].present? }
      @size = @response.size
    end

    # sort records if params[:ornder_by] present
    def sort_records
      @response = response.each do |record|
        order_field = ORDER_PARAMS_MAP.fetch(params[:order_by].to_sym)
        sorted_records = record.fetch(:jobs, []).sort do |a, b|
          a[order_field].downcase <=> b[order_field].downcase
        end
        record[:jobs] = params[:order_dir] == "DESC" ? sorted_records.reverse : sorted_records
      end
    end

    # Select records if page params is present
    def select_pages
      page_size = params[:per_page] ? params[:per_page].to_i : Paginationable::PAGE_SIZE
      to = params[:page].to_i * page_size - 1
      from = to - page_size + 1
      from = 0 if from.negative?
      to = from + (response.size % page_size) if to > response.size

      @response = @response[from..to]
    end
  end
end

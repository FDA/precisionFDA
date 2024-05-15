module SpaceService
  # Responsible for filtering spaces.
  module SpacesFilter
    extend self

    # Filters spaces.
    # @param user [User] User.
    # @param filters [hash] filter params
    # @return [ActiveRecord::Relation<Space>] Filtered spaces.
    def call(user, filters = nil)
      spaces_site_admin = user.site_admin? ? Space.groups : Space.none

      spaces_rsa = user.review_space_admin? ? Space.shared : Space.none

      spaces =
        Space.where(id: spaces_site_admin).joins(:space_memberships).distinct.
          or(
            Space.where(id: spaces_rsa).joins(:space_memberships).distinct,
          ).
          or(
            Space.shared.or(Space.where.not(space_type: "review")).visible_by(user),
          )

      spaces = spaces.where(build_where(filters)).joins(:users) if filters.present?
      spaces
    end

    def call_for_cli(user, params = nil)
      spaces = Space.visible_by(user)
      if params[:locked]
        spaces = spaces.where(state: Space::STATE_LOCKED)
      elsif params[:unactivated]
        spaces = spaces.where(state: Space::STATE_UNACTIVATED)
      else
        spaces = spaces.where(state: Space::STATE_ACTIVE)
      end

      spaces = spaces.where(protected: true) if params[:protected]

      types = []
      types << :private_type if params[:private_type]
      types << :groups if params[:groups]
      types << :government if params[:government]
      types << :review if params[:review]
      types << :administrator if params[:administrator]

      if types.length > 0
        spaces.where(space_type: types)
      else
        spaces
      end
    end
    # Builds AREL where clause.
    # @param filters [hash] filter params.
    # @return [Arel::Node] Built where AREL node.
    def build_where(filters)
      conditions = []
      space_arel = Space.arel_table
      space_type = Space.space_types[filters[:type]]
      space_state = Space.states[filters[:state]]

      conditions << space_arel[:space_type].eq(space_type) if space_type
      conditions << space_arel[:state].eq(space_state) if space_state
      conditions << space_arel[:name].matches(wildcard(filters[:name])) if filters[:name]
      conditions << Arel::Nodes::SqlLiteral.new("CAST(spaces.id AS CHAR)").matches(wildcard(filters[:id])) if filters[:id]
      conditions << space_arel[:created_at].matches(wildcard(filters[:created_at])) if filters[:created_at]
      conditions << space_arel[:updated_at].matches(wildcard(filters[:updated_at])) if filters[:updated_at]
      conditions << space_arel[:description].matches(wildcard(filters[:description])) if filters[:description]

      conditions.reduce(nil) do |where, condition|
        where ? where.and(condition) : condition
      end
    end

    def wildcard(value)
      "%#{value}%"
    end

    private_class_method :build_where
  end
end

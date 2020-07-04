module SpaceService
  # Responsible for filtering spaces.
  module SpacesFilter
    extend self

    # Filters spaces.
    # @param user [User] User.
    # @param query [String] Search query.
    # @return [ActiveRecord::Relation<Space>] Filtered spaces.
    def call(user, query = nil)
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

      spaces = spaces.where(build_where(query)).joins(:users) if query.present?

      spaces
    end

    # Builds AREL where clause.
    # @param query [String] Search query.
    # @return [Arel::Node] Built where AREL node.
    def build_where(query)
      conditions = []
      space_arel = Space.arel_table
      users_arel = User.arel_table
      sanitized_query = "%" + ActiveRecord::Base.sanitize_sql_like(query) + "%"

      state = Space.states[query]
      space_type = Space.space_types[query]

      conditions << space_arel[:state].eq(state) if state
      conditions << space_arel[:space_type].eq(space_type) if space_type

      conditions << space_arel[:name].matches(sanitized_query)
      conditions << users_arel[:dxuser].matches(sanitized_query)
      conditions << users_arel[:first_name].matches(sanitized_query)
      conditions << users_arel[:last_name].matches(sanitized_query)

      conditions.reduce(nil) do |where, condition|
        where ? where.or(condition) : condition
      end
    end

    private_class_method :build_where
  end
end

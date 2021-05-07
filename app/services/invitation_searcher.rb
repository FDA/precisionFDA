# Responsible for users invitation searching.
class InvitationSearcher
  class << self
    # Performs user searching by invitation's email, first name or last name.
    # @param query [String] Query to search users.
    # @return [ActiveRecord::Relation<Invitation>] Found invitations.
    def call(query = nil, exclude = [])
      Invitation.where(conditions(query, exclude))
    end

    private

    # Sanitizes query and adds wildcards for use in SQL LIKE.
    # @param query [String] Query to sanitize.
    # @return [String] Sanitized query.
    def sanitized_like_query(query)
      "%#{ActiveRecord::Base.sanitize_sql_like(query)}%"
    end

    # Returns search conditions.
    # @param query [String] Search query.
    # @return [Arel::Nodes::Node] Arel node containing search conditions.
    def conditions(query, exclude)
      full_conditions = invitations[:user_id].eq(nil)
      full_conditions = full_conditions.and(invitations[:id].not_in(exclude)) if exclude.present?

      if query.present?
        or_conditions = fields.inject(nil) do |relation, field|
          condition = invitations[field].matches(sanitized_like_query(query))
          relation ? relation.or(condition) : condition
        end

        full_conditions = full_conditions.and(or_conditions)
      end

      full_conditions
    end

    # Returns Arel table for Invitation model.
    # @return [Arel::Table] Arel table.
    def invitations
      Invitation.arel_table
    end

    # Returns set of fields to search invitation by.
    # @return [Array<String>] Search fields.
    def fields
      %w(email first_name last_name).freeze
    end
  end
end

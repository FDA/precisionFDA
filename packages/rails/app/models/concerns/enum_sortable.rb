# Contains the method for enum columns ordering.
module EnumSortable
  extend ActiveSupport::Concern

  # Class methods
  module ClassMethods
    def order_by_enum_query(field, dir, enum_hash = nil)
      query = "CASE "
      query += (enum_hash || send(field.to_s.pluralize)).
        sort_by { |name, _| name }.each_with_index.map do |(_, val), idx|
          "WHEN #{field}='#{val}' THEN #{idx}"
        end.join(" ")
      query += " END #{dir}"
      query
    end
  end

  included do
    scope :order_by_enum, lambda { |field, dir|
      order(Arel.sql(order_by_enum_query(field, dir)))
    }
  end
end

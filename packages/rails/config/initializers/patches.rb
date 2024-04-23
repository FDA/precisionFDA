Rails.application.config.to_prepare do
  module Wice
    class WiceGrid
      def do_count #:nodoc:
        @relation
          .all
          .joins(@ar_options[:joins])
          .includes(@ar_options[:include])
          .group(@ar_options[:group])
          .where(@options[:conditions])
          .count
      end
    end
  end

  module WiceGridValidOrder

    def read
      @status.delete(:order) unless order_valid?

      super
    end

    def ordering_columns
      @ordering_columns || []
    end

    def add_ordering_column(column)
      @ordering_columns = ordering_columns << column
    end

    private

    def order_valid?
      return true unless @status
      return true unless @status[:order]

      ordering_columns.include?(complete_column_name(@status[:order]))
    end
  end

  module WiceRendererValidOrder

    def add_column(vc)
      super

      return unless vc.attribute
      return unless vc.ordering

      @grid.add_ordering_column(vc.fully_qualified_attribute_name)
    end
  end

  Wice::WiceGrid.prepend(WiceGridValidOrder)
  Wice::GridRenderer.prepend(WiceRendererValidOrder)
end

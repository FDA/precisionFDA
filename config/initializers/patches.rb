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
end

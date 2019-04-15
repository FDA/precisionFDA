class Workflow
  module Cwl
    class OutputParser
      include ActiveModel::Validations

      attr_reader :step, :name
      delegate :app, to: :step

      validates :name, 'workflow/non_empty_string':true,
                'cwl/out_name':true

      def initialize(name, step)
        @name = name
        @step = step
      end

    end
  end
end

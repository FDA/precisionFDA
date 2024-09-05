class Workflow
  module Cwl
    class InputParser
      include ActiveModel::Validations

      delegate :app, :step_number, :parser, :allowable_link_outputs, to: :step

      validates :name, 'workflow/non_empty_string':true,
                'cwl/in_name':true
      validates :link, 'cwl/in_link_first_step': true, if: -> { step_number == 0 }
      validates :link, 'cwl/in_link': true, if: -> { step_number > 0 }

      def initialize(name, link, step)
        @name = name
        @link = link
        @step = step
      end

      def appropriate_app_input
        app.find_input(name)
      end

      def link_type
        if link.in?(parser.inputs.keys)
          parser.inputs[link]
        else
          output_name = link.split("#{step.prev_step.name}/").second
          step.prev_step.app.find_output(output_name)["class"]
        end
      end

      attr_reader :step, :name, :link
    end
  end
end

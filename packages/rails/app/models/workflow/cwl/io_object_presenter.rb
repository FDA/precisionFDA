class Workflow
  module Cwl
    class IOObjectPresenter
      delegate :app, :slot_number, :stages, to: :slot
      attr_writer :values

      def initialize(io_spec, slot, step_links)
        @io_spec = io_spec
        @slot = slot
        @step_links = step_links
      end

      def build
        {
          name: name,
          class: io_class,
          parent_slot: parent_slot,
          stageName: stage_name,
          values: values,
          requiredRunInput: required_run_input,
          optional: optional,
          label: label,
        }.stringify_keys
      end

      def name
        io_spec["name"]
      end

      attr_reader :slot, :io_spec, :step_links

      def io_class
        io_spec["class"]
      end

      def parent_slot
        slot.slot_id
      end

      def stage_name
        slot.name
      end

      def values
        @values ||= begin
          if slot_number != 0 && step_links.is_a?(Hash)
            link = step_links[name]
            link = link.split("/")
            return { "id" => nil, "name" => nil } if link.length == 1
            configure_values(link)
          else
            { "id" => nil, "name" => nil }
          end
        end
      end

      def required_run_input
        condition = slot_number == 0 && !optional
        condition &&= step_links.is_a?(Hash)
        return true if condition && step_links[name].present?
        false
      end

      def optional
        io_spec["optional"]
      end

      def label
        io_spec["label"]
      end

      def configure_values(link)
        linking_slot = stages.find_slot(link.first)
        output = linking_slot.outputs_objects.select { |out| out.name == link.second }.first
        output.values = { "id" => parent_slot, "name" => stage_name }
        { "id" => linking_slot.slot_id, "name" => output.name }
      end
    end
  end
end

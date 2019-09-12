class Workflow
  module Cwl
    class SlotPresenter
      include ::Workflow::Common

      attr_reader :title, :step, :slot_number, :stages
      delegate :context, :slot_objects, :max_stage_index, to: :stages

      def initialize(title, step_json, slot_number, stages)
        @title = title
        @step = step_json
        @slot_number = slot_number
        @stages = stages
      end

      def build
        {}.tap do |hash|
          hash["uid"] = uid
          hash["name"] = name
          hash["instanceType"] = instance_type
          hash["inputs"] = inputs
          hash["outputs"] = outputs
          hash["slotId"] = slot_id
          hash["prevSlot"] = prev_slot.slot_id if prev_slot_expected?
          hash["nextSlot"] = next_slot.slot_id if next_slot_expected?
          hash["stageIndex"] = stage_index
        end
      end

      def uid
        app.uid
      end

      def name
        app.name || title
      end

      def instance_type
        app.spec["instance_type"]
      end

      def app
        @app ||= App.accessible_by(context).find_by_uid(step["id"])
      end

      def inputs
        inputs_objects.map(&:build)
      end

      def outputs
        outputs_objects.map(&:build)
      end

      def inputs_objects
        @inputs ||= app.spec["input_spec"].map do |input_spec|
          Workflow::Cwl::IOObjectPresenter.new(input_spec, self, step["in"])
        end
      end

      def outputs_objects
        @outputs ||= app.spec["output_spec"].map do |output_spec|
          Workflow::Cwl::IOObjectPresenter.new(output_spec, self, step["out"])
        end
      end

      def slot_id
        @slot_id ||= generate_slot_id
      end

      def prev_slot
        stages.find_slot_by_index(slot_number - 1)
      end

      def prev_slot_expected?
        stage_index != 0
      end

      def stage_index
        slot_number
      end

      def next_slot
        stages.find_slot_by_index(slot_number + 1)
      end

      def next_slot_expected?
        stage_index != max_stage_index
      end
    end
  end
end

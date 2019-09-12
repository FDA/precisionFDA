class Workflow
  module Stages
    class SlotPresenter
      include ActiveModel::Validations
      attr_reader :slot, :slot_number, :base_presenter

      validates :name, 'workflow/slot/name_non_empty': true
      validates :uid, :slot_id, 'workflow/non_empty_string': true
      validates :slot_id, 'workflow/slot/slot_id_unique': true
      validates :app, 'workflow/slot/app_presence': true
      validates :instance_type, 'workflow/non_empty_string': true,
                'workflow/slot/instance_type_inclusion': true
      validates :inputs, :outputs, 'workflow/array_of_hashes': true
      validates :prev_slot, 'workflow/non_empty_string': true, if: :prev_slot_condition
      validates :next_slot, 'workflow/non_empty_string': true, if: :next_slot_condition
      validate :input_objects_valid?

      delegate :context, :slot_objects, :max_stage_index, to: :base_presenter

      def initialize(slot, slot_number, base_presenter)
        @slot = slot
        @slot_number = slot_number
        @base_presenter = base_presenter
      end

      def build
        {}.tap do |hash|
          hash[:executable] = app.dxid
          hash[:id] = slot_id
          hash[:systemRequirements] =
            { main: { instanceType: Job::INSTANCE_TYPES[instance_type] } }
          hash[:input] = stage_inputs if stage_inputs.present?
        end
      end

      def name
        slot["name"]
      end

      def inputs
        slot["inputs"] || []
      end

      def slot_id
        slot["slotId"]
      end

      def uid
        slot["uid"]
      end

      def app
        @app ||= App.accessible_by(context).find_by_uid(uid)
      end

      def stage_index
        slot["stageIndex"]
      end

      def instance_type
        slot["instanceType"]
      end

      def outputs
        slot["outputs"] || []
      end

      def prev_slot
        slot["prevSlot"]
      end

      def next_slot
        slot["nextSlot"]
      end

      def prev_slot_condition
        stage_index && stage_index != 0
      end

      def next_slot_condition
        stage_index && stage_index != max_stage_index
      end

      def input_objects_valid?
        input_objects.each do |input_object|
          next if input_object.valid?

          input_object.errors.messages.values.flatten.each do |value|
            errors.add(:inputs, value)
          end
        end
      end

      def stage_inputs
        @stage_inputs ||= input_objects.each_with_object({}) do |input, stage_inputs|
          next unless input.linked_to_a_stage?
          inputs = {
            "$dnanexus_link": {
              outputField: input.values["name"],
              stage: input.values["id"],
            },
          }
          stage_inputs[input.name] = inputs
        end
      end

      def input_objects
        @input_objects ||= inputs.map.with_index do |input, input_number|
          Workflow::Stages::InputPresenter.new(input, input_number, self)
        end
      end
    end
  end
end

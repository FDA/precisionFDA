class Workflow
  class StagesPresenter
    include ActiveModel::Validations
    attr_reader :slots, :context

    validate :slot_objects_valid?

    def initialize(slots, context)
      @slots = slots
      @context = context
    end

    def build
      slot_objects.map(&:build)
    end

    def slot_objects
      @slot_objects ||= slots.map.with_index do |stage, slot_number|
        Workflow::Stages::SlotPresenter.new(stage, slot_number, self)
      end
    end

    def find_slot(slot_number)
      slot_objects.select { |slot| slot.slot_id == slots_ids[slot_number] }.first
    end

    def find_slots(stage_index)
      slot_objects.select { |slot| slot.stage_index == stage_index }
    end

    def slots_ids
      @slots_ids ||= slot_objects.each_with_object({}) do |slot_presenter, ids|
        ids[slot_presenter.slot_number] = slot_presenter.slot_id
      end
    end

    def output_classes
      @output_classes ||= slot_objects.each_with_object({}) do |slot_presenter, output_classes|
        slot_presenter.outputs.each do |output|
          output_classes[slot_presenter.slot_id] ||= {}
          output_classes[slot_presenter.slot_id][output["name"]] = output["class"]
        end
      end
    end

    def slot_objects_valid?
      slot_objects.each do |slot_object|
        next if slot_object.valid?

        slot_object.errors.messages.values.flatten.each do |value|
          errors.add(:slots, value)
        end
      end
    end
  end
end

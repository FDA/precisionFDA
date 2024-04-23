class Workflow
  module Cwl
    class StagesPresenter
      attr_reader :stages_json, :context

      def initialize(stages_json, context, steps_strings = nil)
        @stages_json = stages_json
        @context = context
        @steps = steps_strings
      end

      def build
        slot_objects.values.reverse.map(&:build).reverse
      end

      def slot_objects
        @slot_objects ||= begin
          arrays = stages_json.map.with_index do |(title, step), index|
            [title, Workflow::Cwl::SlotPresenter.new(title, step, index, self)]
          end
          arrays.to_h
        end
      end

      def max_stage_index
        slot_objects.values.map(&:stage_index).compact.max
      end

      def find_slot_by_index(index)
        slot_objects.values.select { |slot_object| slot_object.slot_id == slots_ids[index] }.first
      end

      def find_slot(title)
        slot_objects[title]
      end

      def slots_ids
        @slots_ids ||= slot_objects.values.each_with_object({}) do |slot_presenter, ids|
          ids[slot_presenter.slot_number] = slot_presenter.slot_id
        end
      end

      def stages_objects
        @stages_objects ||= steps.values[:cwl].map do |step_string|
          obj = ::CwlPresenter.new(step_string)
          obj.valid?
          obj
        end
      end

      def apps
        ActiveRecord::Base.transaction do
          @apps ||= stages_objects.map do |stage_object|
            image = steps[stage_object.title][:attached_image]
            asset = DockerImporter.import(
              context: context,
              attached_image: image,
              docker_image: stage_object.docker_image
            )

            stage_object.asset = asset
            opts = App::CwlParser.parse(stage_object)

            AppService.create_app(@context.user, @context.api, opts)
          end
        end
      end
    end
  end
end

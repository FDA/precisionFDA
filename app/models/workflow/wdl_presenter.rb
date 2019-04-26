class Workflow
  class WdlPresenter < BaseImportPresenter
    def slots
      @slots ||=
        (tasks.map do |task|
          app = create_app(task)

          break unless app

          {
            uid: app.uid,
            name: app.name,
            instanceType: "baseline-8",
            inputs: build_inputs(task, app.name),
            outputs: build_outputs(task, app.name),
            slotId: task.slot_name,
            nextSlot: task.next_slot,
          }.with_indifferent_access
        end || [])
    end

    def docker_images
      tasks.map(&:docker_image).select(&:local?)
    end

    def readme; "" end

    def title
      name
    end

    def params
      {
        workflow_name: name,
        readme: readme,
        workflow_title: title,
        is_new: new?,
      }.with_indifferent_access
    end

    def new?
      true
    end

    private

    def create_app(task)
      app_presenter = App::WdlPresenter.new(parser.to_s([task.name]))

      raise if app_presenter.invalid?

      app_presenter.asset = find_asset_for_task(task)

      opts = app_presenter.build

      AppService.create_app(context, opts)
    rescue => e
      errors.add(:base, "Can't create App for the task '#{task.name}'")
      nil
    end

    def find_asset_for_task(task)
      docker_image = task.docker_image

      assets.find do |asset|
        filename = File.basename(asset.file_paths.first)

        docker_image == DockerImage.from_filename(filename)
      end
    end

    def build_inputs(task, app_name)
      task.inputs.map do |input|
        {
          name: input.name,
          class: input.pfda_type,
          parent_slot: task.slot_name,
          stageName: app_name,
          values: { id: nil, name: nil },
          requiredRunInput: true,
          optional: false,
          label: "",
        }.with_indifferent_access
      end
    end

    def build_outputs(task, app_name)
      task.outputs.map do |output|
        {
          name: output.name,
          class: output.pfda_type,
          parent_slot: task.slot_name,
          stageName: app_name,
          values: { id: nil, name: nil },
          requiredRunInput: true,
          optional: false,
          label: "",
        }.with_indifferent_access
      end
    end

    def parser
      @parser ||= WdlObject.new(raw)
    end

    delegate :tasks, :workflow, to: :parser
    delegate :name, to: :workflow, allow_nil: true
  end
end

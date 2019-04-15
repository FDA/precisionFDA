class Workflow
  class WdlPresenter < Presenter
    attr_accessor :attached_images

    validate :wdl_object_should_be_valid

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

    def assets
      @assets ||= begin
        matched_images = (attached_images || []).each_with_object({}) do |attached, images|
          image_from_file = DockerImage.from_filename(attached.original_filename)
          matched_image = docker_images.find { |image| image == image_from_file }

          images[matched_image] = attached if image_from_file.valid? && matched_image
        end

        matched_images.map do |docker_image, attached|
          DockerImporter.import(
            context: @context,
            attached_image: attached,
            docker_image: docker_image,
          )
        end
      end
    end

    def new?
      true
    end

    private

    def create_app(task)
      app_presenter = App::WdlPresenter.new(wdl_object.to_s([task.name]))

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

    def wdl_object
      @wdl_object ||= WdlObject.new(raw)
    end

    def wdl_object_should_be_valid
      if wdl_object.invalid?
        wdl_object.errors.full_messages.each do |msg|
          errors.add("base", msg)
        end
      end
    end

    delegate :tasks, :workflow, to: :wdl_object
    delegate :name, to: :workflow
  end
end

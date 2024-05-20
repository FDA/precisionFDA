class Workflow
  class CwlPresenter < BaseImportPresenter
    def params
      {
        workflow_name: name,
        readme: readme,
        workflow_title: title,
        is_new: new?,
      }.with_indifferent_access
    end

    def name
      @name ||= parser.name
    end

    def title
      @title ||= parser.title
    end

    def readme
      @readme ||= parser.readme || ""
    end

    def slots
      return [] unless parser.valid?
      @slots ||= cwl_stages_object.build
    end

    def docker_images
      @docker_images ||= begin
        images = parser.steps_objects.map(&:docker_image) + [parser.docker_image]
        images.select do
          |image| image.present? && image.local?
        end
      end
    end

    def cwl_stages_object
      @cwl_stages_object ||= Workflow::Cwl::StagesPresenter.new(
        parser.steps, context, nil
      )
    end

    def parser
      @parser ||= Workflow::Cwl::Parser.new(raw, context)
    end

    def new?
      true
    end
  end
end

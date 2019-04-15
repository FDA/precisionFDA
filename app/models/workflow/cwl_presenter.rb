class Workflow
  class CwlPresenter < Presenter

    def initialize(raw, context, steps_strings = nil)
      super(raw, context)
      @steps_strings = steps_strings
    end

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
      [].map(&:docker_image).select(&:local?)
    end

    def cwl_stages_object
      @cwl_stages_object ||= Workflow::Cwl::StagesPresenter.new(
        parser.steps, context, steps_strings
      )
    end

    def parser
      @parser ||= Workflow::Cwl::Parser.new(raw, context)
    end

    def new?
      true
    end

    private

    attr_reader :steps_strings
  end
end

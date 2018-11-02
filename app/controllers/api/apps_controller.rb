module Api
  class AppsController < ApiController
    def attributes_by_cwl
      if cwl_presenter.valid?
        render json: App::CwlParser.parse(cwl_presenter)
      else
        render json: { errors: cwl_presenter.errors.full_messages }
      end
    rescue Psych::SyntaxError => e
      render json: { errors: [e.message] }
    end

    private

    def cwl_presenter
      @cwl_presenter ||= CwlPresenter.new(params['cwl'])
    end
  end
end

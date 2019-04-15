class Workflow
  class Presenter
    include ActiveModel::Validations

    attr_reader :raw, :context

    validate :parser_valid?, if: 'parser'
    validates :name, 'workflow/non_empty_string': true,
              'workflow/name_format': true
    validates :title, 'workflow/non_empty_string': true
    validates :project, presence: true
    validates :slots, length: { minimum: 1, message: "number is wrong" },
              'workflow/array_of_hashes': true
    validate :stages_valid?

    delegate :slot_objects, to: :stages_object

    def initialize(raw, context)
      @raw = raw
      @context = context
    end

    def build
      {
        project: project,
        name: name,
        title: title,
        stages: stages,
      }
    end

    def name
      @name ||= raw["workflow_name"]
    end

    def params
      raw.slice("workflow_name", "workflow_title", "readme", "is_new")
    end

    def assets; [] end

    private

    def project
      @project ||= context.user.try(:private_files_project)
    end

    def title
      @title ||= raw["workflow_title"]
    end

    def stages
      @stages ||= stages_object.build
    end

    def slots
      @slots ||= raw["slots"]
    end

    def stages_object
      @stages_object ||= Workflow::StagesPresenter.new(slots, context)
    end

    def parser; end

    def parser_valid?
      return if parser.valid?

      parser.errors.messages.values.flatten.each do |value|
        errors.add(:base, value)
      end
    end

    def stages_valid?
      return if errors.any? || stages_object.valid?

      stages_object.errors.messages.values.flatten.each do |msg|
        errors.add(:base, msg)
      end
    end
  end
end

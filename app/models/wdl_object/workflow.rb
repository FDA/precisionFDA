require "wdl_object/parser"

class WdlObject
  class Workflow
    include ActiveModel::Validations

    validates :name, presence: { message: "is not found!" }

    attr_reader :raw

    def initialize(workflow_text)
      @raw = workflow_text
      @parser = Parser.new(@raw)
    end

    def name
      @name ||= parser.parse_workflow_name
    end

    def calls
      @calls ||= parser.parse_calls
    end

    private

    attr_reader :parser
  end
end

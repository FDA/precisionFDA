module GraphDecorator

  COMPARISON_NODES = %w(comparison).freeze
  NOTE_NODES = %w(note answer discussion).freeze
  FILE_NODES = %w(file asset).freeze
  JOB_NODES = %w(job).freeze
  APP_NODE = %w(app).freeze
  WORKFLOW_NODE = %w(workflow).freeze

  class << self

    def for_publisher(context, roots, scope)
      Array.wrap(roots).map { |root| build(context, root, scope) }
    end

    def build(context, record, scope = "public")
      node_class(record).new(context, record, scope)
    end

    private

    def node_class(record)
      case record.klass
      when *COMPARISON_NODES then GraphDecorator::ComparisonNode
      when *NOTE_NODES       then GraphDecorator::NoteNode
      when *FILE_NODES       then GraphDecorator::FileNode
      when *JOB_NODES        then GraphDecorator::JobNode
      when *APP_NODE         then GraphDecorator::AppNode
      when *WORKFLOW_NODE    then GraphDecorator::WorkflowNode
      else
        raise "Invalid klass #{record.klass}"
      end
    end

  end
end

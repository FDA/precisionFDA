module GraphDecorator
  # @abstract implement #children in a child
  class BaseNode

    attr_reader :record
    delegate :uid, :klass, :title, to: :record

    def initialize(context, record, scope)
      @context = context
      @record = record
      @scope = scope
    end

    def to_hash
      {
        uid: uid,
        klass: klass,
        title: record.accessible_by?(context) ? title : uid,
        owned: record.editable_by?(context),
        public: record.public?,
        in_space: record.in_space?,
        publishable: record.publishable_by?(context, scope),
        children: children,
      }
    end

    private

    attr_reader :context, :scope

    def build_child(record)
      ::GraphDecorator.build(context, record, scope)
    end

  end
end


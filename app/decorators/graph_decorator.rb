class GraphDecorator
  
  def initialize(context)
    @context = context
  end

  def for_publisher(roots, scope = "public")
    @scope = scope
    Array.wrap(roots).map { |root| subgraph_of(root) }
  end

  def for_track(root)
    @track_format = true
    subgraph_of(root)
  end

  private

  attr_reader :context, :scope, :track_format

  def subgraph_of(record)
    decorate_node(record, self.send("subgraph_of_#{record.klass}", record))
  end

  def subgraph_of_comparison(comparison)
    return unless comparison.accessible_by?(context)

    comparison.user_files.map do |file|
      decorate_node(file, subgraph_of_file(file))
    end
  end

  def subgraph_of_app(app)
    return unless app.accessible_by?(context)

    app.assets.map do |asset|
      decorate_node(asset, subgraph_of_file(asset))
    end
  end

  def subgraph_of_note(note)
    return unless note.accessible_by?(context)

    note.attachments.map do |attachment|
      children = subgraph_of(attachment.item)
      decorate_node(attachment.item, children)
    end
  end

  def subgraph_of_job(job)
    return unless job.accessible_by?(context)

    children = job.input_files.map do |file|
      decorate_node(file, subgraph_of_file(file))
    end
    children.push(
      decorate_node(job.app, subgraph_of_app(job.app))
    )
  end

  def subgraph_of_file(file)
    return unless file.accessible_by?(context)
    return [decorate_node(file.parent, subgraph_of_job(file.parent))] if file.parent_type == "Job"
    return [decorate_node(file.parent, subgraph_of_comparison(file.parent))] if file.parent_type == "Comparison"
    []
  end

  alias_method :subgraph_of_asset,      :subgraph_of_file
  alias_method :subgraph_of_answer,     :subgraph_of_note
  alias_method :subgraph_of_discussion, :subgraph_of_note

  def decorate_node(record, children)
    return [record, Array.wrap(children)] if track_format

    item = record.slice(:uid, :klass)
    item[:title] = record.accessible_by?(context) ? record.title : record.uid
    item[:owned] = record.editable_by?(context)
    item[:public] = record.public?
    item[:in_space] = record.in_space?
    item[:publishable] = record.publishable_by?(context, scope)
    item[:children] = Array.wrap(children)
    item
  end

end

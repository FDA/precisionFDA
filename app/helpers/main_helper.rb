module MainHelper
  def graph_nodes(graph)
    s = ""
    nodes = {}
    graph_nodes_recursive(nodes, graph)
    nodes.each_pair do |key, value|
      s += "g.setNode(#{key.inspect}, #{value.to_json});\n"
    end
    s
  end

  def graph_edges(graph)
    s = ""
    item = graph[0]
    deps = graph[1]
    deps.each do |dep|
      s += graph_edges(dep)
      s += "g.setEdge(#{dep[0].uid.inspect}, #{item.uid.inspect}, {label: ''});\n"
    end
    s
  end

  def tutorial_complete?(count)
    return count.nil? || count > 0
  end

  def tutorial_state(count)
    if count.nil? || count > 0
      return "default"
    else
      return "warning"
    end
  end

  private

  def graph_nodes_recursive(nodes, graph)
    item = graph[0]
    deps = graph[1]
    uid = item.uid
    if !nodes.has_key?(uid)
      if item.public?
        classname = 'public'
      elsif item.in_space?
        classname = 'in_space'
      else
        classname = item.user_id == @context.user_id ? 'own' : 'not_yours'
      end
      nodes[uid] = {labelType: 'html', label: content_tag(:div, unilinkfw(item), class: 'track-box'), class: classname}
    end
    deps.each do |dep|
      graph_nodes_recursive(nodes, dep)
    end
  end

end
